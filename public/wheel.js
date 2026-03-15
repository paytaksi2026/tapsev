
const socket=io();

const likesList=document.getElementById("likesList");
const giftList=document.getElementById("giftList");
const topLikes=document.getElementById("topLikes");
const wheel=document.getElementById("wheel");

let rotation=0;

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

 topLikes.innerHTML="";
 data.top.forEach(x=>{
   const li=document.createElement("li");
   li.innerText=x[0]+" ❤️ "+x[1];
   topLikes.appendChild(li);
 });

});

socket.on("giftUpdate",(data)=>{

 giftList.innerHTML="";
 data.top.forEach(x=>{
  const li=document.createElement("li");
  li.innerText=x[0]+" 💎 "+x[1];
  giftList.appendChild(li);
 });

});

socket.on("spin",(data)=>{

 for(let i=0;i<data.spins;i++){

  const r=Math.floor(Math.random()*360)+720;
  rotation+=r;

  wheel.style.transition="transform 5s ease-out";
  wheel.style.transform="rotate("+rotation+"deg)";

 }

});
