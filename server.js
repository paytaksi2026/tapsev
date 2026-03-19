const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let players = [];

setInterval(()=>{
    if(players.length === 0){
        players = [
            {username:"demo1",avatar:"https://i.pravatar.cc/40?1",progress:50},
            {username:"demo2",avatar:"https://i.pravatar.cc/40?2",progress:80},
        ];
    }

    players.forEach(p=> p.progress += Math.random()*5);

    io.emit('players', players);
},1000);

server.listen(process.env.PORT||3000);
