
const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");
const spinBtn=document.getElementById("spinBtn");
const result=document.getElementById("result");
const winnerList=document.getElementById("winnerList");
const userBig=document.getElementById("userBig");

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

function showUser(user){
userBig.innerText=user;
userBig.style.opacity=1;
setTimeout(()=>{userBig.style.opacity=0;},2000);
}

function addWinner(user,prize){

const li=document.createElement("li");
li.innerText=user+" → "+prize+" AZN";

winnerList.prepend(li);

if(winnerList.children.length>10){
winnerList.removeChild(winnerList.lastChild);
}

}

function spin(user="Manual"){

if(spinning) return;

spinning=true;

showUser(user);

let prizeIndex = Math.floor(Math.random()*segments.length);

let finalAngle = 360 - (prizeIndex * (360/total)) - (360/(total*2));

let spinAngle = 360*6 + finalAngle;

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

let prize=segments[prizeIndex];

if(prize==="JACKPOT"){

result.innerHTML="🔥 MEGA JACKPOT 5 AZN";

confetti({
particleCount:200,
spread:120,
origin:{y:0.6}
});

addWinner(user,"JACKPOT");

}else{

result.innerHTML=user+" qazandı "+prize+" AZN";

confetti({
particleCount:120,
spread:90,
origin:{y:0.6}
});

addWinner(user,prize);

}

}

}

requestAnimationFrame(animate);

}

spinBtn.onclick=()=>spin("Manual");
