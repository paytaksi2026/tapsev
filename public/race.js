const socket = io();
const c = document.getElementById("c");
const ctx = c.getContext("2d");

c.width = window.innerWidth;
c.height = window.innerHeight;

let players = [];
let raceStarted = false;

socket.emit("join",{username:"user"+Math.random().toFixed(3)});

socket.on("countdown",(n)=>{
    document.getElementById("count").innerText = "START IN "+n;
});

socket.on("winner",(name)=>{
    document.getElementById("count").innerText = "🏆 "+name+" QAZANDI!";
});

socket.on("update",(data)=>{
    players = data.players;
    raceStarted = data.raceStarted;
    draw();
});

function draw(){
    ctx.fillStyle="#0a0";
    ctx.fillRect(0,0,c.width,c.height);

    // road
    ctx.fillStyle="#333";
    ctx.fillRect(0,200,c.width,200);

    // lines
    ctx.strokeStyle="white";
    for(let i=0;i<c.width;i+=40){
        ctx.beginPath();
        ctx.moveTo(i,300);
        ctx.lineTo(i+20,300);
        ctx.stroke();
    }

    players.forEach((p,i)=>{
        let y = 220 + i*40;

        ctx.fillStyle="red";
        ctx.fillRect(p.position,y,40,20);

        ctx.fillStyle="white";
        ctx.fillText(p.username,p.position,y-5);
    });
}
