
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
let queue = [];
let winners = [];
let likers = {};
let raceStarted = false;

const tiktok = new WebcastPushConnection("xeberx.az");

tiktok.connect()
.then(()=> io.emit('status','online'))
.catch(()=> io.emit('status','offline'));

tiktok.on('like', data=>{
    const u = data.uniqueId;
    likers[u] = (likers[u]||0)+data.likeCount;

    if(likers[u] >= 1000){
        join(u,data.profilePictureUrl);
    }

    io.emit('topLikes', getTop(likers));
});

tiktok.on('gift', data=>{
    const u = data.uniqueId;

    if(!players.find(p=>p.username===u)){
        join(u,data.profilePictureUrl);
    }

    let p = players.find(x=>x.username===u);
    if(p) p.speed += 2;
});

function join(username,avatar){
    if(players.length<5 && !raceStarted){
        players.push({username,avatar,progress:0,speed:1});
    }else{
        queue.push({username,avatar});
    }

    io.emit('players',players);
    io.emit('queue',queue);

    if(players.length===5) start();
}

function start(){
    raceStarted=true;
    io.emit('countdown');

    setTimeout(()=>{
        let t=0;
        let int=setInterval(()=>{
            t++;
            players.forEach(p=> p.progress+=p.speed);

            io.emit('update',players);

            if(t>=180){
                clearInterval(int);
                let winner = players.sort((a,b)=>b.progress-a.progress)[0];
                winners.push(winner);
                winners = winners.slice(-15);

                players = queue.splice(0,5);
                raceStarted=false;

                io.emit('winners',winners);
            }
        },1000);
    },10000);
}

function getTop(obj){
    return Object.entries(obj)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,15);
}

server.listen(process.env.PORT||3000);
