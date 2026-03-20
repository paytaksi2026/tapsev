
let size=1;
let canGrow=true;
let timer=300; // 5 min
let breakTime=30;

function grow(v){
 if(!canGrow)return;
 size+=v;
 document.getElementById('balloon').style.transform='scale('+size+')';
}

setInterval(()=>{
 if(canGrow){
   grow(0.02);
   timer--;
   if(timer<=0){
     explode();
   }
 }
},1000);

function explode(){
 canGrow=false;
 document.getElementById('balloon').style.background='white';
 document.getElementById('countdown').innerText='💥 PARTLADI!';
 startBreak();
}

function startBreak(){
 let t=breakTime;
 const el=document.getElementById('countdown');
 let interval=setInterval(()=>{
   el.innerText='Yeni yarış: '+t+'s';
   t--;
   if(t<0){
     clearInterval(interval);
     resetGame();
   }
 },1000);
}

function resetGame(){
 size=1;
 timer=300;
 canGrow=true;
 document.getElementById('balloon').style.transform='scale(1)';
 document.getElementById('balloon').style.background='red';
 document.getElementById('countdown').innerText='';
}
