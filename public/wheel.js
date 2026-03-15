
const socket = io();

const likesList = document.getElementById("likesList");
const winList = document.getElementById("winList");
const wheel = document.getElementById("wheel");

let rotation = 0;

socket.on("liveConnected",()=>{
 document.getElementById("live").innerHTML="🟢 LIVE QOŞULDU";
 document.getElementById("live").style.background="#040";
});

socket.on("likeUpdate",(data)=>{

 const li=document.createElement("li");
 li.innerText=data.user+" ❤️ "+data.total;

 likesList.prepend(li);

 while(likesList.children.length>10){
   likesList.removeChild(likesList.lastChild);
 }

});

socket.on("spin",(data)=>{

 for(let i=0;i<data.spins;i++){

   const random = Math.floor(Math.random()*360)+720;

   rotation += random;

   wheel.style.transition="transform 5s ease-out";
   wheel.style.transform="rotate("+rotation+"deg)";

   setTimeout(()=>{

     const li=document.createElement("li");
     li.innerText=data.user+" qazandı";
     winList.prepend(li);

     while(winList.children.length>10){
       winList.removeChild(winList.lastChild);
     }

   },5000);

 }

});
