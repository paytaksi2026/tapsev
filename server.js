
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
    if(!players[data.uniqueId]){
      players[data.uniqueId] = {
        x: Math.random()*800,
        y: Math.random()*600,
        size: 20,
        hp:100
      };
    }
    players[data.uniqueId].size += 5;
    players[data.uniqueId].hp += 20;
    io.emit("update", players);
  }
});

tiktok.on("like", data=>{
  if(data.totalLikeCount >= 1000){
    if(!players[data.uniqueId]){
      players[data.uniqueId] = {
        x: Math.random()*800,
        y: Math.random()*600,
        size: 20,
        hp:100
      };
    }
    io.emit("update", players);
  }
});

setInterval(()=>{
  const ids = Object.keys(players);
  ids.forEach(id=>{
    let p = players[id];
    p.x += (Math.random()-0.5)*10;
    p.y += (Math.random()-0.5)*10;
    p.hp -= 0.5;
    if(p.hp <=0) delete players[id];
  });

  // collision
  ids.forEach(a=>{
    ids.forEach(b=>{
      if(a!==b && players[a] && players[b]){
        let dx = players[a].x - players[b].x;
        let dy = players[a].y - players[b].y;
        let dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < players[a].size){
          if(players[a].size > players[b].size){
            players[b].hp -= 2;
          } else {
            players[a].hp -= 2;
          }
        }
      }
    });
  });

  io.emit("update", players);
}, 50);

server.listen(3000);
