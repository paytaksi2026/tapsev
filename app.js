function rollDice(){
  let d1 = Math.floor(Math.random()*6)+1;
  let d2 = Math.floor(Math.random()*6)+1;

  document.getElementById("dice1").innerText = d1;
  document.getElementById("dice2").innerText = d2;

  if(d1==6 && d2==6){
    document.getElementById("result").innerText = "ŞEŞ QOŞA! QAZANDI!";
  } else {
    document.getElementById("result").innerText = "Uduzdu";
  }
}

function startGame(user){
  let popup = document.getElementById("popup");
  popup.classList.remove("hidden");

  let count = 15;
  popup.innerText = user + " üçün zər atılır... " + count;

  let interval = setInterval(()=>{
    count--;
    popup.innerText = user + " üçün zər atılır... " + count;

    if(count<=0){
      clearInterval(interval);
      popup.classList.add("hidden");
      rollDice();
    }
  },1000);
}

// demo test
setTimeout(()=> startGame("test_user"),2000);
