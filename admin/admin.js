
function login(){

const u=document.getElementById("user").value;
const p=document.getElementById("pass").value;

if(u==="Ratik" && p==="0123456789"){
  window.location="dashboard.html";
}else{
  alert("Wrong login");
}

}
