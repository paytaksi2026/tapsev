
const socket = io();
let size=1;
let floatOffset=0;

const balloon=document.getElementById('balloon');
const boomSound=new Audio('boom.mp3');

let fragments=[];

function createFragments(){
  for(let i=0;i<40;i++){
    let el=document.createElement("div");
    el.className="fragment";
    document.body.appendChild(el);

    fragments.push({
      el,
      x:window.innerWidth/2,
      y:window.innerHeight/2,
      vx:(Math.random()-0.5)*12,
      vy:(Math.random()-0.5)*12,
      life:120,
      rotate:Math.random()*360
    });
  }
}

function animateFragments(){
  fragments.forEach(f=>{
    f.x+=f.vx;
    f.y+=f.vy;
    f.vy+=0.25;
    f.life--;

    f.el.style.transform=`translate(${f.x}px,${f.y}px) rotate(${f.rotate+=5}deg) scale(${f.life/120})`;
    f.el.style.opacity=f.life/120;
  });

  fragments=fragments.filter(f=>{
    if(f.life<=0){ f.el.remove(); return false;}
    return true;
  });

  requestAnimationFrame(animateFragments);
}
animateFragments();

socket.on('update',(data)=>{

  let users = data.users || {};

  let likeList = Object.entries(users)
    .sort((a,b)=>b[1].likes-a[1].likes)
    .slice(0,10);

  let giftList = Object.entries(users)
    .sort((a,b)=>b[1].gifts-a[1].gifts)
    .slice(0,10);

  document.getElementById('likes').innerHTML =
    likeList.map(u=>"<li>"+u[0]+" "+u[1].likes+"</li>").join("");

  document.getElementById('gifts').innerHTML =
    giftList.map(u=>"<li>"+u[0]+" "+u[1].gifts+"</li>").join("");

  if(data.winners){
    document.getElementById('winners').innerHTML =
      data.winners.map(u=>"<li>"+u+"</li>").join("");
  }

  if(data.phase==="pause"){
    document.getElementById('countdown').innerText="Yeni oyun başlayır: "+data.pauseTime;
    return;
  }

  document.getElementById('countdown').innerText="Time: "+data.timer;

  // REAL physics grow
  size+=0.002;
  if(size>1.6) size=1.6;

  floatOffset+=0.015;
  let y=Math.sin(floatOffset)*10;

  balloon.style.transform=`translateY(${y}px) scale(${size})`;

  // glow pulse
  let glow = Math.sin(floatOffset)*20 + 40;
  balloon.style.boxShadow=`0 0 ${glow}px rgba(255,0,0,0.7)`;
});

socket.on('winner',(data)=>{

  // tension before explosion
  let tension=0;
  let tensionInterval=setInterval(()=>{
    tension++;
    balloon.style.transform=`scale(${size + Math.random()*0.05})`;

    if(tension>20){
      clearInterval(tensionInterval);

      try{boomSound.currentTime=0;boomSound.play();}catch(e){}

      // vibration
      document.body.classList.add("shakeScreen");

      createFragments();

      // explode effect
      balloon.style.transition="0.2s";
      balloon.style.transform="scale(2.5)";
      balloon.style.opacity="0";

      setTimeout(()=>{
        document.body.classList.remove("shakeScreen");
      },500);

      // winner delay (cinematic)
      setTimeout(()=>{
        document.getElementById('winnerPopup').classList.remove('hidden');
        document.getElementById('winnerText').innerText=data.user+" qazandı";
      },2500);

      setTimeout(()=>{
        document.getElementById('winnerPopup').classList.add('hidden');

        balloon.style.opacity='1';
        balloon.style.transform='scale(1)';
        size=1;

      },6000);
    }
  },40);

});


// 🔥 EXTRA REAL MOTION (added, not replacing)
let driftX=0;
let driftY=0;

function ultraRealMotion(){
  driftX += (Math.random()-0.5)*0.2;
  driftY += (Math.random()-0.5)*0.2;

  driftX *= 0.98;
  driftY *= 0.98;

  let extraX = Math.sin(floatOffset*0.7)*6 + driftX;
  let extraY = Math.cos(floatOffset*0.5)*8 + driftY;

  balloon.style.transform = `
    translate(${extraX}px,${extraY}px)
    scale(${size})
  `;

  requestAnimationFrame(ultraRealMotion);
}
ultraRealMotion();
