const socket = io();
const c = document.getElementById("c");
const ctx = c.getContext("2d");

c.width = window.innerWidth;
c.height = window.innerHeight;

let players = [];
let images = {};
let carImg = new Image();
carImg.src = "https://i.imgur.com/7QFQZ5K.png"; // sample car

setInterval(()=>{
    document.getElementById("popup").style.display="block";
    setTimeout(()=>document.getElementById("popup").style.display="none",2000);
},4000);

socket.on("update",(data)=>{
    players = data.players || [];
    draw();
});

function loadAvatar(url,u){
    if(images[u]) return;
    let img = new Image();
    img.src = url;
    images[u]=img;
}

function draw(){
    ctx.fillStyle="#0a0";
    ctx.fillRect(0,0,c.width,c.height);

    // road
    ctx.fillStyle="#444";
    ctx.fillRect(0,200,c.width,200);

    // road lines
    ctx.strokeStyle="white";
    for(let i=0;i<c.width;i+=40){
        ctx.beginPath();
        ctx.moveTo(i,300);
        ctx.lineTo(i+20,300);
        ctx.stroke();
    }

    // spectators (simple animation)
    for(let i=0;i<20;i++){
        ctx.fillStyle="yellow";
        ctx.fillRect(i*80,150 + Math.sin(Date.now()/200+i)*5,10,20);
    }

    players.forEach((p,i)=>{
        let y = 220 + i*50;

        loadAvatar(p.avatar,p.username);

        // car sprite
        ctx.drawImage(carImg,p.position,y,80,40);

        // avatar inside car
        if(images[p.username]){
            ctx.drawImage(images[p.username],p.position+25,y+5,30,30);
        }

        // boost flame
        if(p.speed>5){
            ctx.fillStyle="orange";
            ctx.beginPath();
            ctx.arc(p.position-10,y+20,10,0,Math.PI*2);
            ctx.fill();
        }

        // username
        ctx.fillStyle="white";
        ctx.fillText(p.username,p.position,y-5);
    });

    // start light effect
    ctx.fillStyle="red";
    ctx.beginPath();
    ctx.arc(c.width/2,100,20,0,Math.PI*2);
    ctx.fill();
}
