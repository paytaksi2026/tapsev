
/* Pointer TOP ▼ version — win = number under pointer tip */

const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");
const spinBtn=document.getElementById("spinBtn");
const result=document.getElementById("result");

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

function spin(){

if(spinning) return;
spinning=true;

/* choose prize first */
let prizeIndex=Math.floor(Math.random()*segments.length);

let segAngle=360/total;

/* center angle of chosen segment */
let segmentCenter=(prizeIndex*segAngle)+(segAngle/2);

/* pointer is at TOP (▼) */
let pointerAngle=270;

/* rotation needed */
let delta=pointerAngle-segmentCenter;
let finalAngle=(360+delta)%360;

/* spin several rotations */
let spinAngle=360*7+finalAngle;

let duration=15000;
let start=null;

function animate(t){

 if(!start) start=t;

 let progress=(t-start)/duration;
 if(progress>1) progress=1;

 let eased=easeOut(progress);

 let angle=spinAngle*eased;

 canvas.style.transform=`rotate(${rotation+angle}deg)`;

 if(progress<1){

  requestAnimationFrame(animate);

 }else{

  rotation+=spinAngle;
  spinning=false;

  let prize=segments[prizeIndex];

  if(prize==="JACKPOT"){
   result.innerHTML="🔥 MEGA JACKPOT 5 AZN";
  }else{
   result.innerHTML="QAZANDINIZ "+prize+" AZN";
  }
 }
}

requestAnimationFrame(animate);
}

spinBtn.onclick=spin;
