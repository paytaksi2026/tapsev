let size = 1;

function grow(amount){
  size += amount;
  document.getElementById('balloon').style.transform = 'scale('+size+')';
}

// demo loop (simulate likes/gifts)
setInterval(()=>{
  grow(0.05);
},1000);

// fake online toggle
setInterval(()=>{
  const el = document.getElementById('status');
  if(el.classList.contains('offline')){
    el.classList.remove('offline');
    el.classList.add('online');
    el.innerText = "ONLINE";
  } else {
    el.classList.remove('online');
    el.classList.add('offline');
    el.innerText = "OFFLINE";
  }
},5000);