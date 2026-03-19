
const socket = io();

socket.on('players', render);
socket.on('update', render);

socket.on('countdown', ()=>{
    document.getElementById('countdown').innerText = "START 10...";
    let c = 10;
    let i = setInterval(()=>{
        c--;
        document.getElementById('countdown').innerText = "START " + c;
        if(c<=0){
            clearInterval(i);
            document.getElementById('countdown').innerText = "";
        }
    },1000);
});

socket.on('winner', (w)=>{
    document.getElementById('winner').innerText = "🏆 Qalib: " + w.username;
});

function render(players){
    let track = document.getElementById('track');
    track.innerHTML = '';

    players.forEach((p,i)=>{
        let lane = document.createElement('div');
        lane.className = 'lane';

        let car = document.createElement('div');
        car.className = 'car';
        car.style.left = p.progress + 'px';
        car.innerText = p.username;

        lane.appendChild(car);
        track.appendChild(lane);
    });
}
