
const socket = io();
let size=1;
let floatOffset=0;

const balloon=document.getElementById('balloon');
const boomSound=new Audio('boom.mp3');

let pieces=[];

function createPieces(){
  for(let i=0;i<12;i++){
    let div=document.createElement("div");
    div.className="piece";
    document.body.appendChild(div);

    pieces.push({
      el:div,
      x:window.innerWidth/2,
      y:window.innerHeight/2,
      vx:(Math.random()-0.5)*12,
      vy:(Math.random()-0.5)*12
    });
  }
}

function animatePieces(){
  pieces.forEach(p=>{
    p.x+=p.vx;
    p.y+=p.vy;
    p.el.style.transform=`translate(${p.x}px,${p.y}px)`;
  });
}

setInterval(animatePieces,30);

socket.on('update',(data)=>{

  if(data.phase==="pause"){
    document.getElementById('countdown').innerText="Yeni oyun başlayır: "+data.pauseTime;
    return;
  }

  document.getElementById('countdown').innerText="Time: "+data.timer;

  size+=0.004;
  if(size>1.6) size=1.6;

  floatOffset+=0.02;
  let y=Math.sin(floatOffset)*10;

  balloon.style.transform=`translateY(${y}px) scale(${size})`;
});

socket.on('winner',(data)=>{

  // shake
  let shake=0;
  let sh=setInterval(()=>{
    shake++;
    balloon.style.transform=`translate(${Math.random()*10-5}px,${Math.random()*10-5}px) scale(${size+0.2})`;
    if(shake>10){
      clearInterval(sh);

      // explode
      try{boomSound.currentTime=0;boomSound.play();}catch(e){}

      createPieces();

      balloon.style.opacity='0';

      document.body.classList.add("shakeScreen");

      // DELAY WINNER (IMPORTANT)
      setTimeout(()=>{

        document.body.classList.remove("shakeScreen");

        document.getElementById('winnerPopup').classList.remove('hidden');
        document.getElementById('winnerText').innerText=data.user+" qazandı";

      },2500);

      setTimeout(()=>{
        document.getElementById('winnerPopup').classList.add('hidden');

        balloon.style.opacity='1';
        balloon.style.transform='scale(1)';
        size=1;

        pieces.forEach(p=>p.el.remove());
        pieces=[];

      },6000);

    }
  },50);

});
