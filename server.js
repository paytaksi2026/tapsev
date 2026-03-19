// FULL PRO server (extended logic)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let totalGifts = 0;

const tiktok = new WebcastPushConnection("xeberx.az");

tiktok.connect().then(()=>console.log("TikTok connected"));

tiktok.on('gift', data=>{
    totalGifts += data.diamondCount || 1;
    boost(data.uniqueId, (data.diamondCount||1)*2);
    addUser(data);
});

tiktok.on('like', data=>{
    boost(data.uniqueId, 1);
});

function addUser(data){
    if(players.find(p=>p.username===data.uniqueId)) return;

    if(players.length < 5){
        players.push({
            username:data.uniqueId,
            avatar:data.profilePictureUrl,
            position:0,
            speed:1
        });
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

    io.emit('update', {players, totalGifts});
},100);

server.listen(3000);
