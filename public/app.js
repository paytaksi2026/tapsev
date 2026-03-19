
const socket = io();

let players=[];

socket.on('players',p=>{players=p;render();});
socket.on('update',p=>{players=p;render();});

socket.on('status',s=>{
 document.getElementById('status').innerText = s==="online"?"🟢 ONLINE":"🔴 OFFLINE";
});

socket.on('queue',q=>{
 document.getElementById('queue').innerText="NÖVBƏ: "+q.map(x=>x.username).join(', ');
});

socket.on('winners',w=>{
 document.getElementById('winners').innerText="TOP: "+w.map(x=>x.username).join(', ');
});

socket.on('topLikes',l=>{
 document.getElementById('likes').innerText="LIKE TOP: "+l.map(x=>x[0]).join(', ');
});

function render(){
 let track=document.getElementById('track');
 track.innerHTML='';

 for(let i=0;i<5;i++){
  let lane=document.createElement('div');
  lane.className='lane';

  let car=document.createElement('div');
  car.className='car';
  car.innerText='🚗';
  lane.appendChild(car);

  let p=players[i];
  if(p){
   let u=document.createElement('div');
   u.className='user';
   u.style.left=p.progress+'px';
   u.innerHTML=`<img src="${p.avatar}"><div>${p.username}</div>🔥`;
   lane.appendChild(u);
  }

  track.appendChild(lane);
 }
}
