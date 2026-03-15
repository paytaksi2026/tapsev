
const express=require("express");
const http=require("http");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(express.static("public"));

io.on("connection",(socket)=>{
console.log("client connected");
});

/* DEMO: simulate TikTok gift every 20 sec */
setInterval(()=>{
io.emit("tiktokGift",{user:"demo_user"});
},20000);

server.listen(3000,()=>{
console.log("server running");
});
