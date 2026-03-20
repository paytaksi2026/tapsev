
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const serverHttp = http.createServer(app);
const io = new Server(serverHttp);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let users = {};
let totalGifts = 0;

io.on('connection', (socket) => {
  console.log('User connected');

  // DEMO (later TikTok will trigger this)
  setInterval(()=>{
    let user = "user"+Math.floor(Math.random()*5);

    if(!users[user]) users[user]={likes:0,gifts:0};

    users[user].likes += 1;
    users[user].gifts += Math.floor(Math.random()*3);

    totalGifts += users[user].gifts;

    io.emit('update', {users, totalGifts});
  },2000);

});

serverHttp.listen(PORT, ()=>console.log("Running "+PORT));
