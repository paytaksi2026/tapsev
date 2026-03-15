
const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const {WebcastPushConnection}=require("tiktok-live-connector");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

const username="xeberx.az";

const tiktok = new WebcastPushConnection(username,{
  sessionId: process.env.TT_SESSION || ""
});

let likeCounter={};
let likeStats={};
let giftStats={};
let winStats={};

function top10(obj){
return Object.entries(obj)
.map(([user,value])=>({user,value}))
.sort((a,b)=>b.value-a.value)
.slice(0,10);
}

function broadcast(){
io.emit("leaderboards",{
winners:top10(winStats),
likes:top10(likeStats),
gifts:top10(giftStats)
});
}

tiktok.connect().then(()=>{
console.log("Connected to TikTok live:",username);
io.emit("liveConnected");
}).catch(err=>console.error(err));

tiktok.on("gift",data=>{

const coins=data.diamondCount||0;
const user=data.uniqueId;

giftStats[user]=(giftStats[user]||0)+coins;

const spins=Math.floor(coins/100);

if(spins>0){
io.emit("giftSpin",{user:user,spins:spins});
}

broadcast();
});

tiktok.on("like",data=>{

const user=data.uniqueId;
const likes=data.likeCount||1;

likeStats[user]=(likeStats[user]||0)+likes;

if(!likeCounter[user]) likeCounter[user]=0;

likeCounter[user]+=likes;

let spins=Math.floor(likeCounter[user]/100);

if(spins>0){
likeCounter[user]%=100;
io.emit("giftSpin",{user:user,spins:spins});
}

broadcast();
});

io.on("connection",(socket)=>{

socket.on("recordWin",(data)=>{
const user=data.user;
const prize=data.prize;

winStats[user]=(winStats[user]||0)+Number(prize||0);

broadcast();
});

});

app.use(express.static("public"));

server.listen(3000,()=>{
console.log("Server running on port 3000");
});
