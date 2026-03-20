
const socket = io();
let size=1;
let floatOffset = 0;

const balloon = document.getElementById('balloon');

const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const boomSound = new Audio('boom.mp3');

let particles = [];

function firework(){
  try{ boomSound.currentTime=0; boomSound.play(); }catch(e){}

  for(let i=0;i<150;i++){
    particles.push({
      x: canvas.width/2,
      y: canvas.height/2,
      vx: (Math.random()-0.5)*10,
      vy: (Math.random()-0.5)*10,
      life: 120,
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
    ctx.globalAlpha = p.life/120;
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

  // ultra smooth grow
  size += 0.004;
  if(size > 1.6) size = 1.6;

  // floating effect
  floatOffset += 0.02;
  const floatY = Math.sin(floatOffset) * 10;

  balloon.style.transform='translateY('+floatY+'px) scale('+size+')';
});

socket.on('winner',(data)=>{

  // shake before explode
  let shake=0;
  let interval=setInterval(()=>{
    shake++;
    balloon.style.transform='translate('+(Math.random()*10-5)+'px,'+(Math.random()*10-5)+'px) scale('+(size+0.2)+')';
    if(shake>10){
      clearInterval(interval);

      // explode
      balloon.style.transition='0.2s';
      balloon.style.transform='scale(2.5)';
      balloon.style.opacity='0';

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
        balloon.style.opacity='1';
        balloon.style.transform='scale(1)';
        randomColor();
        particles=[];
      },5000);
    }
  },50);

});
