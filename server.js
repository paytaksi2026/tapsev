const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const {WebcastPushConnection}=require('tiktok-live-connector');

const app=express();
const serverHttp=http.createServer(app);
const io=new Server(serverHttp);

app.use(express.static('public'));

const USERNAME=process.env.TIKTOK_USERNAME||"xeberx.az";

let users={};
let timer=300;

const tiktok=new WebcastPushConnection(USERNAME);

tiktok.connect().then(()=>console.log("TikTok Connected"));

tiktok.on("like",data=>{
 const u=data.uniqueId;
 if(!users[u]) users[u]={likes:0,gifts:0};
 users[u].likes+=data.likeCount||1;
});

tiktok.on("gift",data=>{
 const u=data.uniqueId;
 if(!users[u]) users[u]={likes:0,gifts:0};
 users[u].gifts+=data.diamondCount||1;
});

setInterval(()=>{
 timer--;
 if(timer<=0){
  let w=Object.entries(users).sort((a,b)=>b[1].gifts-a[1].gifts)[0];
  if(w) io.emit("winner",{user:w[0],reward:0});
  users={};
  timer=300;
 }
 io.emit("update",{users,timer});
},1000);

serverHttp.listen(3000);