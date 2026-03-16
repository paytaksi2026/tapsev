
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

let queue = [];
let spinning = false;

async function initDB() {
  await pool.query(`
  CREATE TABLE IF NOT EXISTS queue(
    id SERIAL PRIMARY KEY,
    username TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`
  CREATE TABLE IF NOT EXISTS winners(
    id SERIAL PRIMARY KEY,
    username TEXT,
    prize INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log("DB tables ready");
}

async function loadQueue(){
  const res = await pool.query("SELECT username FROM queue ORDER BY id");
  queue = res.rows.map(r => r.username);
}

async function pushQueue(user){
  await pool.query("INSERT INTO queue(username) VALUES($1)",[user]);
  queue.push(user);
  io.emit("queueUpdate", queue);
}

async function popQueue(){
  if(queue.length === 0) return null;

  const user = queue.shift();

  await pool.query(
    "DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id LIMIT 1)"
  );

  io.emit("queueUpdate", queue);

  return user;
}

async function addWinner(user, prize){
  await pool.query(
    "INSERT INTO winners(username,prize) VALUES($1,$2)",
    [user, prize]
  );
}

async function getWinners(){
  const res = await pool.query(
    "SELECT username,prize FROM winners ORDER BY id DESC LIMIT 10"
  );
  return res.rows;
}

function getRandomSegment(){
  const segments = [
    ...Array(37).fill(0),
    ...Array(4).fill(1),
    ...Array(2).fill(2),
    3
  ];
  return segments[Math.floor(Math.random() * segments.length)];
}

async function processQueue(){

  if(spinning) return;
  if(queue.length === 0) return;

  spinning = true;

  const user = await popQueue();
  const result = getRandomSegment();

  io.emit("spinStart",{user,result});

  setTimeout(async ()=>{

    await addWinner(user,result);

    const winners = await getWinners();
    io.emit("lastWinners", winners);

    spinning = false;

    setTimeout(processQueue,10000);

  },15000);
}

function connectTikTok(){

  console.log("Connecting to TikTok:", TIKTOK_USERNAME);

  const tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

  tiktok.connect().then(()=>{
    console.log("TikTok connected");
  }).catch(err=>{
    console.log("TikTok connect error:", err.message);
    setTimeout(connectTikTok,10000);
  });

  tiktok.on("like", async data => {

    const user = data.uniqueId;

    if(data.likeCount >= 1000){
      await pushQueue(user);
      processQueue();
    }

  });

  tiktok.on("gift", async data => {

    const user = data.uniqueId;

    await pushQueue(user);
    processQueue();

  });

  tiktok.on("disconnected", () => {
    console.log("TikTok disconnected. Reconnecting...");
    setTimeout(connectTikTok,10000);
  });

}

app.use(express.static("public"));

server.listen(PORT, async ()=>{

  await initDB();
  await loadQueue();

  connectTikTok();

  console.log("TikTok Wheel PRO v3 running on port", PORT);

});
