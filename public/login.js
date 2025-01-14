document.querySelector('.btn-login').addEventListener('click',async (event)=>{
  event.preventDefault();
  console.log('Entered ! ');
  const logEm=document.getElementById('emailLog');
  const logPass=document.getElementById('passwordLog');
  const af=document.querySelector('.all-fill');
  af.innerHTML='';
  if(!logEm.value||!logPass.value) {
    af.style.color='red';
    af.innerHTML='Fill all fields !';
    logEm.value='';
    logPass.value='';
    return;
  }
  try{
    const req=await fetch('/login',{
      method:'POST',
      headers :{
        'Content-type':'application/json',
      },
      body:JSON.stringify({email:logEm.value,password:logPass.value})
    });
  
    if(req.ok) {
      console.log('WORKING NA YAAR ! ');
      sessionStorage.setItem('user_email',logEm.value);
      af.style.color='green';
      af.innerHTML='Login successful ! ';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
    else {
      console.log('Not WORKING NA YAAR ! ');
      const resp=await req.json();
      console.log('Still not WORKING NA YAAR ! ');
      af.style.color='red';
      af.innerHTML=resp.error||'Login failed ! ';
    }
  }
  catch(error) {
    console.error(error);
  }
});