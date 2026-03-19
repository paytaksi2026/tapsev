const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

const tiktok = new WebcastPushConnection("xeberx.az");

tiktok.connect().then(()=>console.log("TikTok connected"));

tiktok.on("gift", data=>{
  if(data.diamondCount >= 10){
    players[data.uniqueId] = players[data.uniqueId] || {hp:100,size:20};
    players[data.uniqueId].hp += 20;
    players[data.uniqueId].size += 5;
    io.emit("update", players);
  }
});

tiktok.on("like", data=>{
  if(data.totalLikeCount >= 1000){
    players[data.uniqueId] = players[data.uniqueId] || {hp:100,size:20};
    io.emit("update", players);
  }
});

setInterval(()=>{
  const ids = Object.keys(players);
  ids.forEach(id=>{
    players[id].hp -= 1;
    if(players[id].hp <=0) delete players[id];
  });
  io.emit("update", players);
}, 1000);

io.on("connection", socket=>{});

server.listen(3000, ()=>console.log("Running"));
