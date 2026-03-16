
const socket=io();

const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");

let sectors=[];
let rotation=0;

fetch("/api/sectors").then(r=>r.json()).then(data=>{
 sectors=data;
 draw();
});

function draw(){

 if(sectors.length===0) return;

 const angle=2*Math.PI/sectors.length;

 ctx.clearRect(0,0,500,500);

 for(let i=0;i<sectors.length;i++){

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
  ctx.fillText(sectors[i]+" AZN",150,5);
  ctx.restore();

 }

}

socket.on("spinStart",(data)=>{

 let start=rotation;
 let target=Math.random()*Math.PI*10;

 let startTime=Date.now();
 let duration=4000;

 function anim(){

  let t=(Date.now()-startTime)/duration;

  if(t<1){

   rotation=start+(target-start)*t;

   draw();

   requestAnimationFrame(anim);

  }else{

   document.getElementById("winner").innerText="🎉 "+data.user+" qazandı: "+data.result+" AZN";

  }

 }

 anim();

});
