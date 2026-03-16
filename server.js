
const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const {WebcastPushConnection}=require("tiktok-live-connector");

const TIKTOK_USERNAME="xeberx.az";

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(express.static("public"));

let likeTotals={};
let giftTotals={};
let winners=[];

function topList(obj){
return Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,10);
}

function broadcastTop(){
io.emit("topLike",topList(likeTotals));
io.emit("topGift",topList(giftTotals));
io.emit("topWinners",winners.slice(0,10));
}

const tiktok=new WebcastPushConnection(TIKTOK_USERNAME);

tiktok.connect().then(()=>{
console.log("TikTok connected");
});

tiktok.on("like",data=>{

const user=data.uniqueId;

likeTotals[user]=(likeTotals[user]||0)+data.likeCount;

broadcastTop();

});

tiktok.on("gift",data=>{

const user=data.uniqueId;

giftTotals[user]=(giftTotals[user]||0)+1;

broadcastTop();

});

server.listen(3000,()=>{
console.log("Modern wheel server running");
});
