
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use("/admin", express.static("admin"));

let queue = [];
let spinning = false;

io.on("connection",(socket)=>{
  socket.on("addSpin",(user)=>{
    queue.push(user);
    processQueue();
  });
});

function processQueue(){
  if(spinning) return;
  if(queue.length===0) return;

  spinning=true;
  const user=queue.shift();

  const result = getRandomSegment();

  io.emit("spinStart",{user,result});

  setTimeout(()=>{
     io.emit("spinResult",{user,result});
     spinning=false;
     setTimeout(processQueue,10000);
  },15000);
}

function getRandomSegment(){
  const segments=[
    ...Array(37).fill(0),
    ...Array(4).fill(1),
    ...Array(2).fill(2),
    3
  ];
  return segments[Math.floor(Math.random()*segments.length)];
}

server.listen(3000,()=>{
 console.log("Server running");
});
