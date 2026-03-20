
const socket = io();
let size=1;

const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function firework(){
  for(let i=0;i<50;i++){
    let x=Math.random()*canvas.width;
    let y=Math.random()*canvas.height;
    ctx.fillStyle="hsl("+Math.random()*360+",100%,50%)";
    ctx.fillRect(x,y,5,5);
  }
}

socket.on('update',(data)=>{
  let users=data.users;

  let likeList = Object.entries(users).sort((a,b)=>b[1].likes-a[1].likes).slice(0,10);
  let giftList = Object.entries(users).sort((a,b)=>b[1].gifts-a[1].gifts).slice(0,10);

  document.getElementById('likes').innerHTML = likeList.map(u=>"<li>"+u[0]+" "+u[1].likes+"</li>").join("");
  document.getElementById('gifts').innerHTML = giftList.map(u=>"<li>"+u[0]+" "+u[1].gifts+"</li>").join("");

  document.getElementById('countdown').innerText = "Time: "+data.timer;

  size+=0.02;
  document.getElementById('balloon').style.transform='scale('+size+')';
});

socket.on('winner',(data)=>{
  document.getElementById('winnerPopup').classList.remove('hidden');
  document.getElementById('winnerText').innerText = data.user+" qazandı "+data.reward;

  for(let i=0;i<10;i++){
    setTimeout(firework, i*200);
  }

  setTimeout(()=>{
    document.getElementById('winnerPopup').classList.add('hidden');
  },5000);
});
