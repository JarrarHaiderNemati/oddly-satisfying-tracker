document.addEventListener('DOMContentLoaded',async ()=>{
  fetchDat();
  
});
const ref=document.getElementById('refill');
const catA=document.getElementById('refill-cat');

const ok_b=document.querySelector('.ok-button');
const cancel_b=document.querySelector('.cancel-button');

async function fetchDat() {
  const your=document.getElementById('your');
  

  const ue=sessionStorage.getItem('user_email');
  const req=await fetch('/yourMoment',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
    },
    body:JSON.stringify({
      userEm:ue
    })
  });
  
  if(req.ok) {
    const resp=await req.json();
    your.innerHTML='';
    resp.forEach(element => {
      const li=document.createElement('li');
      li.textContent=`${element.id} - ${element.text} - ${element.category} - ${element.timestamp} - Posted by : You`;
      const del=document.createElement('button');
      const edit=document.createElement('button')
      del.textContent='Delete';
      del.className='del-b';
      edit.textContent='Edit';
      edit.className='ed-b';
      del.addEventListener('click',async()=>{
        const reqss=await fetch('/msg',{
          method:'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body:JSON.stringify({
            nem:`${element.text}`
          })
        });
  
        if(reqss) {
          console.log('Deleted element successfully ! ');
        }
  
        else {
          console.error('Unable to delete element ! ');
        }
        fetchDat();
      });

      edit.addEventListener('click',async()=>{
        document.querySelector('.re-fill-div').style.display='block';
      ref.value=element.text;
      ref.dataset.id=element.id;
      });
      li.appendChild(del);
      li.appendChild(edit);
      your.appendChild(li);
    });
  }
  else {
    your.innerHTML='You have no moments ! ';
  }
}

ok_b.addEventListener('click',async ()=>{
  const id=ref.dataset.id;
  const val=ref.value;
  const reqqs=await fetch(`/ymEdit/${id}`,{
    method:'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify({
      text:`${val}`,
      category:`${catA.value}`
    })
    
  });
  const ans=await reqqs.json();
      if(!ans) {
        console.log('Unable to edit the text ! ');
      }
      else {
        const li = document.querySelector(`li[data-id="${id}"]`);
        if(li)
        li.textContent = `${id} - ${ans.text} - ${ans.category} - ${ans.timestamp}`;
        document.querySelector('.re-fill-div').style.display='none';
        fetchDat();
      }
  
});

cancel_b.addEventListener('click',()=>{
  document.querySelector('.re-fill-div').style.display='none';
});

document.querySelector('.bth').addEventListener('click',()=>{
  window.location.href='index.html';
});