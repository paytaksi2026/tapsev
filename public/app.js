
const socket = io();
let players=[];

socket.on('players',p=>{
 players=p;
});

socket.on('update',p=>{
 players=p;
});

socket.on('countdown',()=>{
 startCountdown();
});

socket.on('winners',w=>{
 document.getElementById('top').innerText="TOP 10: "+w.map(x=>x.username).join(', ');
});

function startCountdown(){
 let c=10;
 let el=document.getElementById('countdown');

 let i=setInterval(()=>{
  el.innerText="START "+c;
  c--;
  if(c<0){
   clearInterval(i);
   el.innerText="";
  }
 },1000);
}

function loop(){
 render();
 requestAnimationFrame(loop);
}
loop();

function render(){
 let track=document.getElementById('track');
 track.innerHTML='';

 for(let i=0;i<5;i++){
  let lane=document.createElement('div');
  lane.className='lane';

  let finish=document.createElement('div');
  finish.className='finish';
  lane.appendChild(finish);

  let car=document.createElement('div');
  car.className='car';
  car.innerText='🚗';
  lane.appendChild(car);

  let p=players[i];
  if(p){
   let u=document.createElement('div');
   u.className='user';
   u.style.transform=`translateX(${p.progress}px)`;

   u.innerHTML=`<img src="${p.avatar}"><div>${p.username}</div><div class="fire">🔥</div>`;
   lane.appendChild(u);
  }

  track.appendChild(lane);
 }
}
