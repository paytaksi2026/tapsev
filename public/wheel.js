
const socket = io();

const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");

const segments=44;
let angle=0;

function drawWheel(){
 const r=250;
 ctx.clearRect(0,0,500,500);

 for(let i=0;i<segments;i++){
   const a=(i*(Math.PI*2)/segments)+angle;

   ctx.beginPath();
   ctx.moveTo(250,250);
   ctx.arc(250,250,r,a,a+(Math.PI*2)/segments);
   ctx.fillStyle=i%2?"#444":"#666";
   ctx.fill();
 }

}

drawWheel();

socket.on("spinStart",(data)=>{
 spin();
});

function spin(){
 let duration=15000;
 let start=Date.now();

 function animate(){
   let t=(Date.now()-start)/duration;

   if(t<1){
     angle+=0.3*(1-t);
     drawWheel();
     requestAnimationFrame(animate);
   }
 }

 animate();
}
