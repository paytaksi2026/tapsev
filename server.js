const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let stats = {};

const tiktok = new WebcastPushConnection("xeberx.az");

tiktok.connect().then(()=>console.log("TikTok connected"));

tiktok.on('like', data=>{
    const u = data.uniqueId;
    if(!stats[u]) stats[u] = {likes:0,gifts:0,avatar:data.profilePictureUrl};
    stats[u].likes += data.likeCount || 1;
    checkJoin(u);
    boost(u,1);
});

tiktok.on('gift', data=>{
    const u = data.uniqueId;
    if(!stats[u]) stats[u] = {likes:0,gifts:0,avatar:data.profilePictureUrl};
    stats[u].gifts += 1;
    checkJoin(u);
    boost(u,5);
});

function checkJoin(u){
    const s = stats[u];
    if(!s) return;

    if((s.gifts >= 10 || s.likes >= 1000) && !players.find(p=>p.username===u)){
        if(players.length < 5){
            players.push({
                username:u,
                avatar:s.avatar,
                position:0,
                speed:2
            });
        }
    }
}

function boost(u,power){
    players.forEach(p=>{
        if(p.username===u){
            p.speed += power;
        }
    });
}

setInterval(()=>{
    players.forEach(p=>{
        p.position += p.speed;
    });
    io.emit("update", players);
},100);

server.listen(3000);
