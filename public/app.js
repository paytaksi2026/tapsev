
const socket = io();

let size=1;

socket.on('update', (data)=>{
  let users = data.users;

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

  grow(0.05);
});

function grow(v){
  size+=v;
  document.getElementById('balloon').style.transform='scale('+size+')';
}
