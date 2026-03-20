
const socket = io();
let size=1;

const balloon = document.getElementById('balloon');

const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const boomSound = new Audio('boom.mp3');

let particles = [];

function firework(){
  boomSound.currentTime=0;
  boomSound.play();

  for(let i=0;i<120;i++){
    particles.push({
      x: canvas.width/2,
      y: canvas.height/2,
      vx: (Math.random()-0.5)*8,
      vy: (Math.random()-0.5)*8,
      life: 100,
      color: "hsl("+Math.random()*360+",100%,50%)"
    });
  }
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  particles.forEach(p=>{
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life/100;
    ctx.fillRect(p.x,p.y,3,3);
  });

  particles = particles.filter(p=>p.life>0);
  ctx.globalAlpha = 1;

  requestAnimationFrame(animate);
}
animate();

function randomColor(){
  const colors=[
    ["#ff6b6b","#b30000"],
    ["#6bafff","#003bb3"],
    ["#6bff9e","#00b33c"],
    ["#ffd86b","#b38600"],
    ["#d96bff","#6a00b3"]
  ];
  let c=colors[Math.floor(Math.random()*colors.length)];
  balloon.style.background="radial-gradient(circle at 30% 30%,"+c[0]+","+c[1]+")";
}
randomColor();

socket.on('update',(data)=>{

  document.getElementById('winners').innerHTML =
    data.winners.map(u=>"<li>"+u+"</li>").join("");

  if(data.phase==="pause"){
    document.getElementById('countdown').innerText =
      "Yeni oyun başlayır: "+data.pauseTime;
    return;
  }

  let users=data.users;

  let likeList = Object.entries(users).sort((a,b)=>b[1].likes-a[1].likes).slice(0,10);
  let giftList = Object.entries(users).sort((a,b)=>b[1].gifts-a[1].gifts).slice(0,10);

  document.getElementById('likes').innerHTML = likeList.map(u=>"<li>"+u[0]+" "+u[1].likes+"</li>").join("");
  document.getElementById('gifts').innerHTML = giftList.map(u=>"<li>"+u[0]+" "+u[1].gifts+"</li>").join("");

  document.getElementById('countdown').innerText = "Time: "+data.timer;

  size += 0.008;
  if(size > 1.8) size = 1.8;

  balloon.style.transform='scale('+size+')';
});

socket.on('winner',(data)=>{
  balloon.style.transform='scale(2.2)';
  balloon.style.transition='0.2s';

  setTimeout(()=>{
    balloon.style.display='none';
  },200);

  document.getElementById('winnerPopup').classList.remove('hidden');
  document.getElementById('winnerText').innerText = data.user+" qazandı";

  firework();

  setTimeout(()=>{
    document.getElementById('winnerPopup').classList.add('hidden');
    size=1;
    balloon.style.display='block';
    balloon.style.transform='scale(1)';
    randomColor();
    particles=[];
  },5000);
});
