
const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const {WebcastPushConnection}=require("tiktok-live-connector");
const {Pool}=require("pg");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

const PORT=process.env.PORT||3000;
const TIKTOK_USERNAME=process.env.TIKTOK_USERNAME||"xeberx.az";

const pool=new Pool({
 connectionString:process.env.DATABASE_URL,
 ssl:{rejectUnauthorized:false}
});

app.use(express.json());
app.use(express.static("public"));

let queue=[];
let spinning=false;

async function initDB(){

 await pool.query(`CREATE TABLE IF NOT EXISTS queue(
  id SERIAL PRIMARY KEY,
  username TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 )`);

 await pool.query(`CREATE TABLE IF NOT EXISTS winners(
  id SERIAL PRIMARY KEY,
  username TEXT,
  prize INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 )`);

 await pool.query(`CREATE TABLE IF NOT EXISTS sectors(
  id SERIAL PRIMARY KEY,
  value INT
 )`);

 const check=await pool.query("SELECT COUNT(*) FROM sectors");
 if(parseInt(check.rows[0].count)===0){
  const defaultValues=[...Array(37).fill(0),...Array(4).fill(1),...Array(2).fill(2),3];
  for(const v of defaultValues){
   await pool.query("INSERT INTO sectors(value) VALUES($1)",[v]);
  }
 }

}

async function loadQueue(){
 const r=await pool.query("SELECT username FROM queue ORDER BY id");
 queue=r.rows.map(x=>x.username);
}

async function pushQueue(user){
 await pool.query("INSERT INTO queue(username) VALUES($1)",[user]);
 queue.push(user);
 io.emit("queueUpdate",queue);
}

async function popQueue(){
 if(queue.length===0) return null;

 const user=queue.shift();

 await pool.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id LIMIT 1)");

 io.emit("queueUpdate",queue);

 return user;
}

async function addWinner(user,prize){
 await pool.query("INSERT INTO winners(username,prize) VALUES($1,$2)",[user,prize]);
}

async function getWinners(){
 const r=await pool.query("SELECT username,prize FROM winners ORDER BY id DESC LIMIT 10");
 return r.rows;
}

async function getSectors(){
 const r=await pool.query("SELECT value FROM sectors ORDER BY id");
 return r.rows.map(x=>x.value);
}

async function randomPrize(){

 const sectors=await getSectors();

 return sectors[Math.floor(Math.random()*sectors.length)];

}

async function processQueue(){

 if(spinning) return;
 if(queue.length===0) return;

 spinning=true;

 const user=await popQueue();
 const result=await randomPrize();

 io.emit("spinStart",{user,result});

 setTimeout(async()=>{

  await addWinner(user,result);

  const winners=await getWinners();

  io.emit("lastWinners",winners);

  spinning=false;

  setTimeout(processQueue,5000);

 },8000);

}

function connectTikTok(){

 const tiktok=new WebcastPushConnection(TIKTOK_USERNAME);

 tiktok.connect().then(()=>{

  console.log("TikTok connected");

 }).catch(e=>{

  console.log("TikTok error:",e.message);
  setTimeout(connectTikTok,10000);

 });

 tiktok.on("like",async data=>{

  if(data.likeCount>=1000){

   await pushQueue(data.uniqueId);
   processQueue();

  }

 });

 tiktok.on("gift",async data=>{

  await pushQueue(data.uniqueId);
  processQueue();

 });

 tiktok.on("disconnected",()=>{

  console.log("TikTok reconnect...");
  setTimeout(connectTikTok,10000);

 });

}

app.get("/api/sectors",async(req,res)=>{

 const s=await getSectors();
 res.json(s);

});

app.post("/api/sectors",async(req,res)=>{

 const arr=req.body;

 await pool.query("DELETE FROM sectors");

 for(const v of arr){
  await pool.query("INSERT INTO sectors(value) VALUES($1)",[v]);
 }

 res.json({ok:true});

});

server.listen(PORT,async()=>{

 await initDB();
 await loadQueue();
 connectTikTok();

 console.log("TikTok Wheel PRO v9 running",PORT);

});
