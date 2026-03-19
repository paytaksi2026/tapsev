const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

let queue = [];
let racePlayers = [];
let totalCoins = 0;
let leaderboard = {};

function tryStartRace(){
  if(queue.length >= 5){
    racePlayers = queue.splice(0,5);
    io.emit("racePlayers", racePlayers);
    io.emit("raceStart");
  }
}

io.on("connection", (socket)=>{
  console.log("Connected");

  // simulate TikTok gift
  socket.on("gift", (user)=>{
    totalCoins += 10;

    if(!queue.includes(user)){
      queue.push(user);
    }

    tryStartRace();
    io.emit("queue", queue);
  });

  socket.on("finish", (winner)=>{
    let reward = totalCoins * 0.1;

    leaderboard[winner] = (leaderboard[winner] || 0) + 1;

    io.emit("winner", {winner, reward, leaderboard});

    totalCoins = 0;
    racePlayers = [];
  });
});

server.listen(PORT, ()=>console.log("Running " + PORT));
