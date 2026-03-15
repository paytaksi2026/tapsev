
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
let giftCounter = {};
let winners = [];

function top5(obj){
 return Object.entries(obj)
   .sort((a,b)=>b[1]-a[1])
   .slice(0,5);
}

tiktok.connect().then(()=>{
 console.log("Connected to TikTok live:",username);
 io.emit("liveConnected");
}).catch(err=>console.error(err));

tiktok.on("gift",(data)=>{

 const user=data.uniqueId;
 const coins=data.diamondCount || 0;

 if(!giftCounter[user]) giftCounter[user]=0;
 giftCounter[user]+=coins;

 io.emit("giftUpdate",{user,total:giftCounter[user],top:top5(giftCounter)});

 const spins=Math.floor(coins/100);

 if(spins>0){
   io.emit("spin",{user,spins});
 }

});

tiktok.on("like",(data)=>{

 const user = data.uniqueId;
 const likes = data.likeCount || 1;

 if(!likeCounter[user]){
   likeCounter[user] = 0;
 }

 likeCounter[user] += likes;

 io.emit("likeUpdate",{
   user,
   total: likeCounter[user],
   top: top5(likeCounter)
 });

 if(likeCounter[user] >= 100){

   const spins = Math.floor(likeCounter[user] / 100);
   likeCounter[user] = likeCounter[user] % 100;

   io.emit("spin",{ user, spins });

 }

});

app.use(express.static("public"));

server.listen(3000,()=>{
 console.log("Server running on port 3000");
});
