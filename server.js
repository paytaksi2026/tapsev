const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

function randomDamage(){
  const ids = Object.keys(players);
  if(ids.length === 0) return;
  const id = ids[Math.floor(Math.random()*ids.length)];
  players[id].hp -= 10;
  if(players[id].hp <= 0){
    players[id].hp = 0;
    players[id].dead = true;
  }
}

setInterval(()=>{
  randomDamage();
  io.emit("update", players);
}, 5000);

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    players[socket.id] = { username, hp: 100, dead:false };
    io.emit("update", players);
  });

  socket.on("gift", () => {
    if(players[socket.id] && !players[socket.id].dead){
      players[socket.id].hp += 15;
      io.emit("effect", { type:"heal", user: players[socket.id].username });
      io.emit("update", players);
    }
  });

  socket.on("attack", (targetId)=>{
    if(players[socket.id] && players[targetId]){
      players[targetId].hp -= 20;
      io.emit("effect", { type:"attack", from: players[socket.id].username, to: players[targetId].username });
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

server.listen(3000, ()=>console.log("PRO server running"));
