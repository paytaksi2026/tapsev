
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const serverHttp = http.createServer(app);
const io = new Server(serverHttp);

const PORT = process.env.PORT || 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.static(path.join(__dirname, 'public')));

let users = {};
let totalGifts = 0;
let timer = 300;

async function saveWinner(username, reward){
  await pool.query(
    "INSERT INTO winners(username, reward) VALUES($1,$2)",
    [username, reward]
  );
}

io.on('connection', (socket) => {
  console.log("Client connected");

  socket.emit("status", "ONLINE");
});

setInterval(()=>{
  timer--;

  if(timer <= 0){
    let winner = Object.entries(users)
      .sort((a,b)=>b[1].gifts-a[1].gifts)[0];

    if(winner){
      let reward = totalGifts * 0.1;
      saveWinner(winner[0], reward);

      io.emit("winner", {user:winner[0], reward});
    }

    users = {};
    totalGifts = 0;
    timer = 300;
  }

  io.emit("update", {users, totalGifts, timer});

},1000);

// DEMO growth (replace with TikTok events later)
setInterval(()=>{
  let user = "user"+Math.floor(Math.random()*10);

  if(!users[user]) users[user]={likes:0,gifts:0};

  users[user].likes += 1;
  users[user].gifts += Math.floor(Math.random()*5);

  totalGifts += 5;

},2000);

serverHttp.listen(PORT, ()=>console.log("Running "+PORT));
