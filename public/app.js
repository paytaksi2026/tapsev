
const socket = io();
let size=1;
let floatOffset=0;

const balloon=document.getElementById('balloon');
const boomSound=new Audio('boom.mp3');

let fragments=[];

function createFragments(){
  for(let i=0;i<20;i++){
    let el=document.createElement("div");
    el.className="fragment";
    document.body.appendChild(el);

    fragments.push({
      el,
      x:window.innerWidth/2,
      y:window.innerHeight/2,
      vx:(Math.random()-0.5)*8,
      vy:(Math.random()-0.5)*8,
      life:80
    });
  }
}

function animateFragments(){
  fragments.forEach(f=>{
    f.x+=f.vx;
    f.y+=f.vy;
    f.vy+=0.2; // gravity
    f.life--;

    f.el.style.transform=`translate(${f.x}px,${f.y}px)`;
    f.el.style.opacity=f.life/80;
  });

  fragments=fragments.filter(f=>{
    if(f.life<=0){ f.el.remove(); return false;}
    return true;
  });

  requestAnimationFrame(animateFragments);
}
animateFragments();

socket.on('update',(data)=>{

  if(data.phase==="pause"){
    document.getElementById('countdown').innerText="Yeni oyun başlayır: "+data.pauseTime;
    return;
  }

  document.getElementById('countdown').innerText="Time: "+data.timer;

  size+=0.003; // slower (fix)
  if(size>1.5) size=1.5;

  floatOffset+=0.02;
  let y=Math.sin(floatOffset)*8;

  balloon.style.transform=`translateY(${y}px) scale(${size})`;
});

socket.on('winner',(data)=>{

  let shake=0;
  let sh=setInterval(()=>{
    shake++;
    balloon.style.transform=`translate(${Math.random()*6-3}px,${Math.random()*6-3}px) scale(${size+0.1})`;

    if(shake>12){
      clearInterval(sh);

      try{boomSound.currentTime=0;boomSound.play();}catch(e){}

      createFragments();

      balloon.style.transition="0.3s";
      balloon.style.transform="scale(2)";
      balloon.style.opacity="0";

      document.body.classList.add("shakeScreen");

      setTimeout(()=>{
        document.body.classList.remove("shakeScreen");
      },400);

      setTimeout(()=>{
        document.getElementById('winnerPopup').classList.remove('hidden');
        document.getElementById('winnerText').innerText=data.user+" qazandı";
      },2000);

      setTimeout(()=>{
        document.getElementById('winnerPopup').classList.add('hidden');

        balloon.style.opacity='1';
        balloon.style.transform='scale(1)';
        size=1;

      },5000);
    }
  },40);

});
