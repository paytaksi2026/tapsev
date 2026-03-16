
const socket=io();
const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");

const segments=44;
const prizes=[...Array(37).fill(0),...Array(4).fill(1),...Array(2).fill(2),3];
const angle=2*Math.PI/segments;

let rotation=0;

function draw(){
ctx.clearRect(0,0,500,500);

for(let i=0;i<segments;i++){
 let start=i*angle+rotation;
 let end=start+angle;

 ctx.beginPath();
 ctx.moveTo(250,250);
 ctx.arc(250,250,240,start,end);
 ctx.fillStyle=i%2?"#d4af37":"#222";
 ctx.fill();

 ctx.save();
 ctx.translate(250,250);
 ctx.rotate(start+angle/2);
 ctx.fillStyle="white";
 ctx.fillText(prizes[i]+" AZN",150,5);
 ctx.restore();
}
}
draw();

socket.on("spinStart",(data)=>{

document.getElementById("result").innerText="🎡 "+data.user+" üçün fırlanır";

let target=Math.random()*Math.PI*10;

let start=rotation;
let duration=4000;
let startTime=Date.now();

function anim(){
let t=(Date.now()-startTime)/duration;

if(t<1){
 rotation=start+(target-start)*t;
 draw();
 requestAnimationFrame(anim);
}else{

 document.getElementById("winnerPopup").style.display="block";
 document.getElementById("winnerName").innerText=data.user;
 document.getElementById("winnerPrize").innerText=data.result+" AZN";

 setTimeout(()=>{
  document.getElementById("winnerPopup").style.display="none";
 },4000);

 document.getElementById("result").innerText="🎉 "+data.user+" qazandı: "+data.result+" AZN";
}
}

anim();

});
