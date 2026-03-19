const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = [];
let images = {};

socket.on("update", data=>{
    players = data;
    draw();
});

function loadAvatar(url, username){
    if(images[username]) return;
    const img = new Image();
    img.src = url;
    images[username] = img;
}

function draw(){
    ctx.fillStyle="#111";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#333";
    ctx.fillRect(0,100,canvas.width,300);

    ctx.fillStyle="white";
    ctx.fillRect(canvas.width-150,100,10,300);

    players.forEach((p,i)=>{
        let y = 120 + i*80;

        loadAvatar(p.avatar, p.username);

        ctx.fillStyle="red";
        ctx.fillRect(p.position,y,120,50);

        if(images[p.username]){
            ctx.drawImage(images[p.username], p.position+40, y-30,40,40);
        }

        ctx.fillStyle="white";
        ctx.fillText(p.username,p.position,y-10);
    });
}
