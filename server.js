
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const username = "xeberx.az";

const tiktok = new WebcastPushConnection(username,{
  sessionId: process.env.TT_SESSION || ""
});

let likeCounter = {};
let winners = [];

tiktok.connect().then(()=>{
  console.log("Connected to TikTok live:",username);
  io.emit("liveConnected");
}).catch(err=>console.error(err));

tiktok.on("gift",(data)=>{

  const coins = data.diamondCount || 0;
  const spins = Math.floor(coins/100);

  if(spins>0){
    io.emit("spin",{user:data.uniqueId, spins:spins});
  }

});

tiktok.on("like",(data)=>{

  const user=data.uniqueId;

  if(!likeCounter[user]) likeCounter[user]=0;

  likeCounter[user]+=1;

  io.emit("likeUpdate",{user:user,total:likeCounter[user]});

  if(likeCounter[user]>=100){

    let spins=Math.floor(likeCounter[user]/100);
    likeCounter[user]%=100;

    io.emit("spin",{user:user,spins:spins});

  }

});

app.use(express.static("public"));

server.listen(3000,()=>{
  console.log("Server running on port 3000");
});
