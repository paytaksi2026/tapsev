
const socket = io();

let username = "user" + Math.floor(Math.random()*1000);

socket.emit('join',{username});

socket.on('players', (players)=>{
    render(players);
});

socket.on('update', (players)=>{
    render(players);
});

socket.on('winner', (w)=>{
    document.getElementById('winner').innerText = "Qalib: " + w.username;
});

function render(players){
    let track = document.getElementById('track');
    track.innerHTML = '';

    players.forEach(p=>{
        let div = document.createElement('div');
        div.className = 'car';
        div.style.marginLeft = p.progress + 'px';
        div.innerText = p.username;
        track.appendChild(div);
    });
}
