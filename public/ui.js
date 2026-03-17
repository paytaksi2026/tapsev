
const socket = io();

socket.on('queue', (q)=>{
  const el = document.getElementById('queue');
  el.innerHTML = q.map(u=>`<li>${u}</li>`).join('');
});

socket.on('winners', (w)=>{
  const el = document.getElementById('winners');
  el.innerHTML = w.map(u=>`<li>${u.username} +${u.amount}</li>`).join('');
});
