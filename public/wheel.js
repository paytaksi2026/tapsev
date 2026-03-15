
const socket = io();

socket.on("liveConnected",()=>{
 const el=document.getElementById("liveStatus");
 if(el){
  el.innerHTML="🟢 LIVE QOŞULDU";
  el.style.background="#030";
 }
});

socket.on("giftSpin",(data)=>{
 console.log("SPIN:",data);
});

socket.on("likeUpdate",(data)=>{

 const list=document.getElementById("likesList");
 if(!list) return;

 const li=document.createElement("li");
 li.innerText=data.user+" ❤️ "+data.total;

 list.prepend(li);

 while(list.children.length>10){
  list.removeChild(list.lastChild);
 }

});
