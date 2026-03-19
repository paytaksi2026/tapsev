const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");
const config = require("./config.json");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

let queue = [];
let racePlayers = [];
let totalCoins = 0;
let leaderboard = {};

const tiktok = new WebcastPushConnection(config.tiktokUser);

tiktok.connect().then(() => {
  console.log("TikTok LIVE connected");
}).catch(err => console.error(err));

tiktok.on("gift", (data) => {
  let coins = data.diamondCount || 0;
  let user = data.uniqueId;
  let avatar = data.profilePictureUrl;

  if(coins < config.minCoins) return;

  totalCoins += coins;

  if(!queue.find(u => u.user === user)){
    queue.push({user, avatar});
  }

  if(queue.length >= 5){
    racePlayers = queue.splice(0,5);
    io.emit("racePlayers", racePlayers);
    io.emit("raceStart");
  }
});

io.on("connection", (socket)=>{
  socket.on("finish", (winner)=>{
    let reward = totalCoins * 0.1;

    leaderboard[winner.user] = (leaderboard[winner.user] || 0) + 1;

    io.emit("winner", {winner, reward, leaderboard});

    totalCoins = 0;
    racePlayers = [];
  });
});

server.listen(PORT, ()=>console.log("Running " + PORT));
