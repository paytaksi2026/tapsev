
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const { WebcastPushConnection } = require('tiktok-live-connector');
const path = require('path');

const app = express();
const serverHttp = http.createServer(app);
const io = new Server(serverHttp);

const PORT = process.env.PORT || 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || "xeberx.az";

app.use(express.static(path.join(__dirname, 'public')));

let users = {};
let totalGifts = 0;
let timer = 300;

const tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

// CONNECT
tiktok.connect().then(() => {
  console.log("TikTok Connected");
  io.emit("status","ONLINE");
}).catch(()=> io.emit("status","OFFLINE"));

// LIKE
tiktok.on('like', data => {
  const user = data.uniqueId;
  if(!users[user]) users[user]={likes:0,gifts:0};
  users[user].likes += data.likeCount || 1;
});

// GIFT
tiktok.on('gift', data => {
  const user = data.uniqueId;
  const coins = data.diamondCount || 1;
  if(!users[user]) users[user]={likes:0,gifts:0};
  users[user].gifts += coins;
  totalGifts += coins;
});

// DB winner save
async function saveWinner(username, reward){
  try{
    await pool.query("CREATE TABLE IF NOT EXISTS winners(id SERIAL PRIMARY KEY, username TEXT, reward NUMERIC, created_at TIMESTAMP DEFAULT NOW())");
    await pool.query("INSERT INTO winners(username,reward) VALUES($1,$2)",[username,reward]);
  }catch(e){console.log(e.message)}
}

// MAIN LOOP
setInterval(()=>{
  timer--;

  if(timer <= 0){
    let winner = Object.entries(users).sort((a,b)=>b[1].gifts-a[1].gifts)[0];

    if(winner){
      let reward = totalGifts * 0.1;
      saveWinner(winner[0], reward);
      io.emit("winner",{user:winner[0],reward});
    }

    users = {};
    totalGifts = 0;
    timer = 300;
  }

  io.emit("update",{users,totalGifts,timer});

},1000);

serverHttp.listen(PORT, ()=>console.log("Running "+PORT));
