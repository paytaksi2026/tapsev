
const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const {WebcastPushConnection}=require("tiktok-live-connector");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

const username="xeberx.az";

const tiktok=new WebcastPushConnection(username);

tiktok.connect().then(state=>{
console.log("Connected to TikTok live:",state.roomId);
}).catch(err=>{
console.error("TikTok connection failed",err);
});

tiktok.on("gift",data=>{

let coins=data.diamondCount || 0;

let spins=Math.floor(coins/100);

if(spins>0){

io.emit("giftSpin",{
user:data.uniqueId,
spins:spins
});

console.log(data.uniqueId,"sent",coins,"coins →",spins,"spins");

}

});

app.use(express.static("public"));

server.listen(3000,()=>{
console.log("Server running");
});
