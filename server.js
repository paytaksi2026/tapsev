const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
const tiktokUsername = "xeberx.az";

// TikTok connect
const tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect().then(() => {
  console.log("TikTok connected");
}).catch(err => console.error(err));

// Gift event
tiktok.on("gift", data => {
  const user = data.uniqueId;
  Object.values(players).forEach(p=>{
    if(p.username === user && !p.dead){
      p.hp += 20;
    }
  });
  io.emit("effect",{type:"tiktok_gift", user});
  io.emit("update", players);
});

// Like event
tiktok.on("like", data => {
  const user = data.uniqueId;
  Object.values(players).forEach(p=>{
    if(p.username === user && !p.dead){
      p.hp += 5;
    }
  });
  io.emit("update", players);
});

function randomDamage(){
  const ids = Object.keys(players);
  if(ids.length === 0) return;
  const id = ids[Math.floor(Math.random()*ids.length)];
  players[id].hp -= 5;
  if(players[id].hp <= 0){
    players[id].hp = 0;
    players[id].dead = true;
  }
}

setInterval(()=>{
  randomDamage();
  io.emit("update", players);
}, 4000);

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    players[socket.id] = { username, hp: 100, dead:false };
    io.emit("update", players);
  });

  socket.on("attack", (targetId)=>{
    if(players[socket.id] && players[targetId]){
      players[targetId].hp -= 20;
      if(players[targetId].hp <=0){
        players[targetId].hp=0;
        players[targetId].dead=true;
      }
      io.emit("update", players);
    }
  });

  socket.on("disconnect", ()=>{
    delete players[socket.id];
    io.emit("update", players);
  });

});

server.listen(3000, ()=>console.log("TikTok REAL server running"));
