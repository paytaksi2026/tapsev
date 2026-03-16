
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");
const { Pool } = require("pg");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || "xeberx.az";

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false }
});

app.use(express.static("public"));

let queue = [];
let spinning = false;

async function loadQueue(){
 const res = await pool.query("SELECT username FROM queue ORDER BY id");
 queue = res.rows.map(r=>r.username);
}

async function pushQueue(user){
 await pool.query("INSERT INTO queue(username) VALUES($1)",[user]);
 queue.push(user);
 io.emit("queueUpdate",queue);
}

async function popQueue(){
 if(queue.length===0) return null;

 const user = queue.shift();

 await pool.query(
 "DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id LIMIT 1)"
 );

 io.emit("queueUpdate",queue);

 return user;
}

async function addWinner(user,prize){
 await pool.query(
 "INSERT INTO winners(username,prize) VALUES($1,$2)",
 [user,prize]
 );
}

async function getWinners(){
 const res = await pool.query(
 "SELECT username,prize FROM winners ORDER BY id DESC LIMIT 10"
 );
 return res.rows;
}

function getRandomSegment(){
 const segments=[
 ...Array(37).fill(0),
 ...Array(4).fill(1),
 ...Array(2).fill(2),
 3
 ];
 return segments[Math.floor(Math.random()*segments.length)];
}

async function processQueue(){

 if(spinning) return;
 if(queue.length===0) return;

 spinning = true;

 const user = await popQueue();
 const result = getRandomSegment();

 io.emit("spinStart",{user,result});

 setTimeout(async()=>{

 await addWinner(user,result);

 const winners = await getWinners();
 io.emit("lastWinners", winners);

 io.emit("spinResult",{user,result});

 spinning = false;

 setTimeout(processQueue,10000);

 },15000);
}

const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

tiktokLiveConnection.connect();

tiktokLiveConnection.on("like", async data => {

 const user = data.uniqueId;

 if(data.likeCount >= 1000){
   await pushQueue(user);
   processQueue();
 }

});

tiktokLiveConnection.on("gift", async data => {

 const user = data.uniqueId;

 await pushQueue(user);
 processQueue();

});

server.listen(PORT, async ()=>{

 await loadQueue();

 console.log("TikTok Wheel PRO running on port",PORT);

});
