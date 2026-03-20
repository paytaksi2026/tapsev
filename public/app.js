
const socket = io();
let size=1;

socket.on('update',(data)=>{
  let users=data.users;

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

  document.getElementById('countdown').innerText = "Time: "+data.timer;

  grow(0.03);
});

socket.on('winner',(data)=>{
  alert("QALİB: "+data.user+" qazandı "+data.reward);
  fireworks();
});

function grow(v){
  size+=v;
  document.getElementById('balloon').style.transform='scale('+size+')';
}

function fireworks(){
  const canvas=document.getElementById('fireworks');
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;

  for(let i=0;i<100;i++){
    ctx.fillStyle="hsl("+Math.random()*360+",100%,50%)";
    ctx.beginPath();
    ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, 3,0,Math.PI*2);
    ctx.fill();
  }

  setTimeout(()=>ctx.clearRect(0,0,canvas.width,canvas.height),2000);
}
