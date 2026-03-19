// TikTok LIVE real connector + race system (requires npm install tiktok-live-connector)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let queue = [];
let connected = false;

const tiktokUsername = "xeberx.az";
const tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect().then(()=>{
    connected = true;
    console.log("TikTok connected");
}).catch(err=>{
    console.log("TikTok error", err);
});

tiktok.on('like', data=>{
    const user = data.uniqueId;
    boost(user, 1);
});

tiktok.on('gift', data=>{
    const user = data.uniqueId;
    const power = data.diamondCount || 5;
    boost(user, power);
});

tiktok.on('chat', data=>{
    addUser(data.uniqueId, data.profilePictureUrl);
});

function addUser(username, avatar){
    if(players.find(p=>p.username===username)) return;

    if(players.length < 5){
        players.push({username, avatar, position:0, speed:1});
    }else{
        queue.push({username, avatar});
    }
}

function boost(username, power){
    players.forEach(p=>{
        if(p.username===username){
            p.speed += power;
        }
    });
}

setInterval(()=>{
    players.forEach(p=>{
        p.position += p.speed;
    });
    io.emit('update', players);
},100);

io.on('connection', (socket)=>{
    socket.emit('status', connected);
});

server.listen(3000, ()=>console.log("running"));
