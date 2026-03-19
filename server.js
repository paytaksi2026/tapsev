
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let players = [];

const tiktok = new WebcastPushConnection("xeberx.az");

tiktok.connect()
.then(()=> console.log("LIVE CONNECTED"))
.catch(()=> console.log("LIVE ERROR"));

tiktok.on('like', data=>{
    const u = data.uniqueId;

    if(!players.find(p=>p.username===u)){
        players.push({
            username:u,
            avatar:data.profilePictureUrl,
            progress:0,
            speed:1
        });
    }

    players.forEach(p=>{
        if(p.username===u) p.speed += 0.5;
    });

    io.emit('likeEffect', u);
});

tiktok.on('gift', data=>{
    const u = data.uniqueId;

    if(!players.find(p=>p.username===u)){
        players.push({
            username:u,
            avatar:data.profilePictureUrl,
            progress:0,
            speed:1
        });
    }

    players.forEach(p=>{
        if(p.username===u) p.speed += 2;
    });

    io.emit('nitro', u);
});

setInterval(()=>{
    players.forEach(p=>{
        p.progress += p.speed;
    });

    io.emit('players', players);
},100);

server.listen(process.env.PORT||3000);
