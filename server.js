
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
const WIDTH = 1200, HEIGHT = 700;

function spawnPlayer(name){
  return {
    x: Math.random()*WIDTH,
    y: Math.random()*HEIGHT,
    vx: (Math.random()-0.5)*2,
    vy: (Math.random()-0.5)*2,
    size: 18 + Math.random()*6,
    hp: 80 + Math.random()*40,
    name
  };
}

// DEMO BOTS
function addBots(n=6){
  for(let i=0;i<n;i++){
    const id = "BOT_" + i;
    if(!players[id]){
      players[id] = spawnPlayer("Bot"+i);
    }
  }
}
addBots(6);

// TikTok (safe connect + retry)
const USERNAME = "xeberx.az";
let tiktok = new WebcastPushConnection(USERNAME);

async function connectTikTok(){
  try{
    await tiktok.connect();
    console.log("TikTok connected");
  }catch(e){
    console.log("TikTok not live, retrying in 5s");
    setTimeout(connectTikTok, 5000);
  }
}
connectTikTok();

tiktok.on("gift", data=>{
  if(data.diamondCount >= 10){
    const id = data.uniqueId;
    if(!players[id]) players[id] = spawnPlayer(id);
    players[id].size += 4;
    players[id].hp = Math.min(150, players[id].hp + 20);
    io.emit("effect", {type:"gift", user:id});
  }
});

tiktok.on("like", data=>{
  if(data.totalLikeCount >= 1000){
    const id = data.uniqueId;
    if(!players[id]) players[id] = spawnPlayer(id);
    io.emit("effect", {type:"like", user:id});
  }
});

// physics + collision
setInterval(()=>{
  const ids = Object.keys(players);

  ids.forEach(id=>{
    const p = players[id];
    p.x += p.vx;
    p.y += p.vy;

    // bounce walls
    if(p.x < 20 || p.x > WIDTH-20) p.vx *= -1;
    if(p.y < 20 || p.y > HEIGHT-20) p.vy *= -1;

    // slight friction + random drift
    p.vx += (Math.random()-0.5)*0.2;
    p.vy += (Math.random()-0.5)*0.2;

    // natural drain
    p.hp -= 0.1;
    if(p.hp <= 0) delete players[id];
  });

  // collisions
  const keys = Object.keys(players);
  for(let i=0;i<keys.length;i++){
    for(let j=i+1;j<keys.length;j++){
      const a = players[keys[i]];
      const b = players[keys[j]];
      if(!a || !b) continue;

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < a.size + b.size){
        // push apart
        const overlap = (a.size + b.size) - dist;
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        a.x += nx * overlap * 0.5;
        a.y += ny * overlap * 0.5;
        b.x -= nx * overlap * 0.5;
        b.y -= ny * overlap * 0.5;

        // damage: smaller takes more
        if(a.size > b.size){
          b.hp -= 0.6;
        } else if(b.size > a.size){
          a.hp -= 0.6;
        } else {
          a.hp -= 0.3; b.hp -= 0.3;
        }
      }
    }
  }

  io.emit("update", players);
}, 30);

// allow manual join (for testing)
io.on("connection", socket=>{
  socket.on("join", (name)=>{
    if(!players[name]){
      players[name] = spawnPlayer(name);
    }
    io.emit("update", players);
  });
});

server.listen(3000, ()=>console.log("ULTRA FIX running"));
