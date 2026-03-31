
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
app.use(express.static(__dirname));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

const username = "jabbarov.bb";
const tiktokLive = new WebcastPushConnection(username);

let clients = [];

tiktokLive.connect().then(() => {
    console.log("TikTok LIVE qoşuldu:", username);
}).catch(err => {
    console.error("Qoşulma xətası:", err);
});

tiktokLive.on('like', data => {
    broadcast({type:'like', user:data.uniqueId, count:data.likeCount});
});

tiktokLive.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return;
    broadcast({type:'gift', user:data.uniqueId, diamonds:data.diamondCount});
});

function broadcast(msg){
    clients.forEach(ws => ws.send(JSON.stringify(msg)));
}

wss.on('connection', ws => {
    clients.push(ws);
    ws.on('close', ()=>{
        clients = clients.filter(c=>c!==ws);
    });
});

server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});


let rewardsData = {};

app.get('/rewards', (req,res)=>{
 res.json(rewardsData);
});
