
const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");
const spinBtn=document.getElementById("spinBtn");
const result=document.getElementById("result");
const winnerList=document.getElementById("winnerList");
const bigUser=document.getElementById("bigUser");

const socket = io();

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

ctx.clearRect(0,0,720,720);

for(let i=0;i<total;i++){

ctx.beginPath();
ctx.moveTo(360,360);
ctx.arc(360,360,360,i*arc,(i+1)*arc);

if(segments[i]==="JACKPOT"){
ctx.fillStyle="#FFD700";
}else{
ctx.fillStyle=`hsl(${i*12},85%,55%)`;
}

ctx.fill();

ctx.save();
ctx.translate(360,360);
ctx.rotate(i*arc+arc/2);

ctx.fillStyle="#000";
ctx.font="bold 36px Arial";
ctx.textAlign="center";
ctx.fillText(segments[i],260,10);

ctx.restore();
}
}

drawWheel();

function easeOut(t){
return 1-Math.pow(1-t,3);
}

function showUser(user){
bigUser.innerText=user;
bigUser.style.opacity=1;
setTimeout(()=>{bigUser.style.opacity=0},2000);
}

function addWinner(user,prize){

const li=document.createElement("li");
li.innerText=user+" → "+prize+" AZN";

winnerList.prepend(li);

while(winnerList.children.length>5){
winnerList.removeChild(winnerList.lastChild);
}

}

let audioCtx=null;
function clickSound(){
if(!audioCtx){
audioCtx=new(window.AudioContext||window.webkitAudioContext)();
}
const osc=audioCtx.createOscillator();
const gain=audioCtx.createGain();

osc.frequency.value=1200;
gain.gain.value=0.05;

osc.connect(gain);
gain.connect(audioCtx.destination);

osc.start();
osc.stop(audioCtx.currentTime+0.02);
}

function spin(user="Manual"){

if(spinning) return;
spinning=true;

showUser(user);

let prizeIndex=Math.floor(Math.random()*segments.length);

let segAngle=360/total;
let segmentCenter=(prizeIndex*segAngle)+(segAngle/2);

let pointerAngle=0;
let delta=pointerAngle-segmentCenter;
let finalAngle=(360+delta)%360;

let spinAngle=360*7+finalAngle;

let duration=15000;
let start=null;
let lastTick=0;

function animate(t){

if(!start) start=t;

let progress=(t-start)/duration;
if(progress>1) progress=1;

let eased=easeOut(progress);

let angle=spinAngle*eased;

canvas.style.transform=`rotate(${rotation+angle}deg)`;

if(t-lastTick>70){
clickSound();
lastTick=t;
}

if(progress<1){
requestAnimationFrame(animate);
}else{

rotation+=spinAngle;
spinning=false;

let prize=segments[prizeIndex];

if(prize==="JACKPOT"){
result.innerHTML="🔥 MEGA JACKPOT 5 AZN";
addWinner(user,"JACKPOT");
}else{
result.innerHTML=user+" qazandı "+prize+" AZN";
addWinner(user,prize);
}
}
}

requestAnimationFrame(animate);

}

/* manual spin */
spinBtn.onclick=()=>spin("Manual");

/* auto spin when gift comes */
socket.on("tiktokGift",(data)=>{
spin("@"+data.user);
});
