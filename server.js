
const { WebcastPushConnection } = require('tiktok-live-connector');

const username = "balacaqiz2026";
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

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', ws => {
    clients.push(ws);
    ws.on('close', ()=>{
        clients = clients.filter(c=>c!==ws);
    });
});
