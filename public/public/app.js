
const socket = io();
let size=1;

socket.on('update',(data)=>{
  let users=data.users;

  let likeList = Object.entries(users).sort((a,b)=>b[1].likes-a[1].likes).slice(0,10);
  let giftList = Object.entries(users).sort((a,b)=>b[1].gifts-a[1].gifts).slice(0,10);

  document.getElementById('likes').innerHTML = likeList.map(u=>"<li>"+u[0]+" "+u[1].likes+"</li>").join("");
  document.getElementById('gifts').innerHTML = giftList.map(u=>"<li>"+u[0]+" "+u[1].gifts+"</li>").join("");

  document.getElementById('countdown').innerText = "Time: "+data.timer;

  grow(0.02);
});

socket.on('winner',(data)=>{
  showWinner(data.user,data.reward);
  fireworks();
});

function grow(v){
  size+=v;
  document.getElementById('balloon').style.transform='scale('+size+')';
}

function showWinner(user,reward){
  let div=document.createElement('div');
  div.style.position='fixed';
  div.style.top='40%';
  div.style.left='50%';
  div.style.transform='translate(-50%,-50%)';
  div.style.background='black';
  div.style.color='gold';
  div.style.fontSize='30px';
  div.innerText="🏆 "+user+" qazandı "+reward;
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),5000);
}

function fireworks(){
  const canvas=document.getElementById('fireworks');
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;

  for(let i=0;i<150;i++){
    ctx.fillStyle="hsl("+Math.random()*360+",100%,50%)";
    ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,3,3);
  }

  setTimeout(()=>ctx.clearRect(0,0,canvas.width,canvas.height),2000);
}
