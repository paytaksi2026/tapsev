const socket = io();

let players = [];

socket.on('players', p=>{
    players = p;
    render();
});

function render(){
    const track = document.getElementById('track');
    track.innerHTML = "";

    for(let i=0;i<5;i++){
        let lane = document.createElement('div');
        lane.className = 'lane';

        let car = document.createElement('div');
        car.className = 'car';
        car.innerText = "🚗";
        lane.appendChild(car);

        let p = players[i];
        if(p){
            let u = document.createElement('div');
            u.className = 'user';
            u.style.left = p.progress + "px";
            u.innerHTML = `<img src="${p.avatar}"><div>${p.username}</div>`;
            lane.appendChild(u);
        }

        track.appendChild(lane);
    }
}
