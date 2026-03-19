const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = [];

socket.on("status", s=>{
    document.getElementById("status").innerText = s ? "🟢 CONNECTED" : "🔴 NOT CONNECTED";
});

socket.on("update", data=>{
    players = data;
    draw();
});

function draw(){
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // road
    ctx.fillStyle = "#333";
    ctx.fillRect(0,100,canvas.width,300);

    // finish
    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width-100,100,10,300);

    players.forEach((p,i)=>{
        const y = 120 + i*60;

        // car
        ctx.fillStyle = "red";
        ctx.fillRect(p.position, y, 80,40);

        // name
        ctx.fillStyle = "white";
        ctx.fillText(p.username, p.position, y-5);
    });
}
