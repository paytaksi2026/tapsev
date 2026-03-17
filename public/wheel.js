
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

const segments = 40;
const values = Array.from({length:40}, (_,i)=>{
  const vals = [0.10,0.20,0.30,0.50,1,2,5];
  return vals[i % vals.length];
});

let angle = 0;
let spinning = false;

function drawWheel(){
  ctx.clearRect(0,0,600,600);

  const cx = 300, cy = 300, r = 250;

  for(let i=0;i<segments;i++){
    let start = (i/segments)*Math.PI*2 + angle;
    let end = ((i+1)/segments)*Math.PI*2 + angle;

    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,start,end);
    ctx.fillStyle = i%2 ? "#111" : "#aa0000";
    ctx.fill();

    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(start + (end-start)/2);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText(values[i]+" AZN", r-60,5);
    ctx.restore();
  }

  // center
  ctx.beginPath();
  ctx.arc(cx,cy,60,0,Math.PI*2);
  ctx.fillStyle="#000";
  ctx.fill();

  // pointer
  ctx.beginPath();
  ctx.moveTo(cx,20);
  ctx.lineTo(cx-10,50);
  ctx.lineTo(cx+10,50);
  ctx.fillStyle="#fff";
  ctx.fill();
}

function spin(){
  if(spinning) return;
  spinning = true;

  let start = Date.now();
  let duration = 10000;

  function animate(){
    let t = (Date.now()-start)/duration;

    if(t<1){
      angle += (1-t)*0.3;
      drawWheel();
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      calculateResult();
    }
  }

  animate();
}

function calculateResult(){
  let normalized = (Math.PI*2 - (angle % (Math.PI*2)));
  let index = Math.floor((normalized/(Math.PI*2))*segments);
  let value = values[index];

  alert("Qazandın: " + value + " AZN");
}

drawWheel();

// test spin
canvas.onclick = spin;
