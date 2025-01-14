document.querySelector('.btn-register').addEventListener('click',async (event)=>{
  event.preventDefault();
  const fn=document.getElementById('fullname');
const em=document.getElementById('email');
const pas=document.getElementById('password');
const conpas=document.getElementById('confirm-password');
  const fillAll=document.querySelector('.fill-all');
  if(!fn||!em||!pas||!conpas) {
    fillAll.style.color='red';
    fillAll.innerHTML='Fill all the fields !';
    fn.value='';
    em.value='';
    pas.value='';
    conpas.value='';
    return;
  }
  else if(pas.value!==conpas.value) {
    fillAll.style.color='red';
    fillAll.innerHTML='Passwords dont match !';
    return;
  }
  fillAll.innerHTML='';
  const req=await fetch('/signup',{
    method:'POST',
    headers:{
      'Content-type':'application/json',
    },
    body:JSON.stringify({
      fullname:fn.value,
      email:em.value,
      password:pas.value
    })
  });
  if(req.ok) {
    sessionStorage.setItem('user_email',em.value);
    fillAll.style.color='green';
    fillAll.innerHTML='Signup successful ! ';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
  else {
    fillAll.style.color='red';
    const errr=await req.json();
    fillAll.innerHTML=errr.error||'Signup failed ! ';
  }
});