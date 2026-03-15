const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");
const spinBtn=document.getElementById("spinBtn");
const result=document.getElementById("result");
const spinSound=document.getElementById("spinSound");
const userOverlay=document.getElementById("userOverlay");
const giftOverlay=document.getElementById("giftOverlay");

const socket = typeof io !== "undefined" ? io() : null;

const segments=[
"0","0","0","0","0","0","0","0","0","0",
"0","0","0","0","0","0","0","0","0","0",
"0","0","0","0","1","1","1","2","3","JACKPOT"
];

const total=segments.length;
const arc=(Math.PI*2)/total;

let rotation=0;
let spinning=false;

function drawWheel(){

ctx.clearRect(0,0,650,650);

for(let i=0;i<total;i++){

ctx.beginPath();
ctx.moveTo(325,325);
ctx.arc(325,325,325,i*arc,(i+1)*arc);

if(segments[i]==="JACKPOT"){
ctx.fillStyle="#FFD700";
}else{
ctx.fillStyle=`hsl(${i*12},80%,55%)`;
}

ctx.fill();

ctx.save();
ctx.translate(325,325);
ctx.rotate(i*arc+arc/2);

ctx.fillStyle="black";
ctx.font="bold 34px Arial";
ctx.textAlign="center";
ctx.fillText(segments[i],230,10);

ctx.restore();
}
}

drawWheel();

function showUser(user){

userOverlay.innerText=user;
userOverlay.style.opacity=1;

giftOverlay.style.opacity=1;

setTimeout(()=>{
userOverlay.style.opacity=0;
giftOverlay.style.opacity=0;
},2000);

}

function spin(user=""){

if(spinning) return;

spinning=true;
spinSound.play();

if(user){
showUser(user+" göndərdi 🎁");
}

let spinAngle=Math.random()*360+1800;
let duration=15000;
let start=null;

function animate(t){

if(!start) start=t;

let progress=t-start;

let angle=spinAngle*(progress/duration);

canvas.style.transform=`rotate(${rotation+angle}deg)`;

if(progress<duration){

requestAnimationFrame(animate);

}else{

rotation+=spinAngle;

spinning=false;

showResult(user);

}

}

requestAnimationFrame(animate);

}

function showResult(user){

let normalized=(rotation%360);

let index=Math.floor((360-normalized)/(360/total))%total;

let prize=segments[index];

if(prize==="JACKPOT"){

result.innerHTML="🔥 MEGA JACKPOT 5 AZN";

confetti({
particleCount:200,
spread:120,
origin:{y:0.6}
});

}else{

result.innerHTML=(user?user+" ":"")+"QAZANDI: "+prize+" AZN";

confetti({
particleCount:120,
spread:90,
origin:{y:0.6}
});

}

}

spinBtn.onclick=()=>spin("Manual");

if(socket){
socket.on("spin",(data)=>{
spin("@"+data.user);
});
}
