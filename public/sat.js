const moment=document.getElementById('moment');
const display=document.getElementById('food');
const cat=document.getElementById('category');
const ref=document.getElementById('refill');
const catA=document.getElementById('refill-cat');

const ok_b=document.querySelector('.ok-button');
const cancel_b=document.querySelector('.cancel-button');

document.addEventListener('DOMContentLoaded', () =>{
  if (!localStorage.getItem('valval')) {
    localStorage.setItem('valval', JSON.stringify(1));
  }
  else {
    localStorage.setItem('valval',JSON.stringify(1));
  }
}); 

const pro_div=document.querySelector('.pro-pro');
pro_div.addEventListener('click',()=>{
  const pid=document.querySelector('.prof-in-div');
  
  
  const item=localStorage.getItem('valval');
  const storeItem=JSON.parse(item);
  if(storeItem===0) {
    pid.style.display='block';
    localStorage.setItem('valval',JSON.stringify(1));
  }
  else {
    pid.style.display='none';
    localStorage.setItem('valval',JSON.stringify(0));
  }
    
  
});

const searchButton=document.getElementById('search');
searchButton.addEventListener('input',async ()=>{
  const ue=sessionStorage.getItem('user_email');
  const valGet=searchButton.value;
  if(valGet) {
    const req=await fetch(`/search?query=${encodeURIComponent(valGet)}`);
    const resp=await req.json();
    if(!resp) {
      console.error('Error fetching data ! ');
      return;
    }
    display.innerHTML='';
    resp.forEach(element => {
      const ue=sessionStorage.getItem('user_email');
      const del=document.createElement('button');
    del.className='del-b';
    del.textContent='Delete';
    const edit=document.createElement('button');
    edit.className='ed-b';
    edit.textContent='Edit';
    if(ue===element.email) {
    edit.addEventListener('click',async()=>{
      document.querySelector('.re-fill-div').style.display='block';
      ref.value=element.text;
      ref.dataset.id=element.id;
    });
  }
  else {
    edit.style.backgroundColor='grey';
  }
    const li=document.createElement('li');
    const poster=element.email===ue ? 'You':element.full_name;
    li.textContent=`${element.id} - ${element.text} - ${element.category} - ${element.timestamp} - Posted by -${poster}`;
    li.appendChild(del);
    li.appendChild(edit);
    if(ue===element.email) {
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
      
    });
  }
  else {
    del.style.backgroundColor='grey';
  }
    display.appendChild(li);
    });
  }
  else {
    fetchData();
  }
});

ok_b.addEventListener('click',async ()=>{
  const id=ref.dataset.id;
  const val=ref.value;
  const reqqs=await fetch(`/msg/${id}`,{
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
        fetchData();
      }
  
});

cancel_b.addEventListener('click',()=>{
  document.querySelector('.re-fill-div').style.display='none';
});



async function fetchData() {
  const ue=sessionStorage.getItem('user_email');
  const request=await fetch('/msg');
  const resp=await request.json();
  if(!resp) {
    console.log('Error fetching data from backend ! ');
    return;
  }
  display.innerHTML='';
  resp.forEach(element => {
    const del=document.createElement('button');
    del.className='del-b';
    del.textContent='Delete';
    const edit=document.createElement('button');
    edit.className='ed-b';
    edit.textContent='Edit';
    if(ue===element.email) {
    edit.addEventListener('click',async()=>{
      document.querySelector('.re-fill-div').style.display='block';
      ref.value=element.text;
      ref.dataset.id=element.id;
    });
  }
  else {
    edit.style.backgroundColor='grey';
  }
    const li=document.createElement('li');
    const poster=element.email===ue ? 'You':element.full_name;
    li.textContent=`${element.id} - ${element.text} - ${element.category} - ${element.timestamp} - Posted by :${poster}`;
    li.appendChild(del);
    li.appendChild(edit);

    if(ue===element.email) {
  
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
      fetchData();
    });
  }
  else {
    del.style.backgroundColor='grey';
  }
    display.appendChild(li);
  });
};
fetchData();

document.getElementById('sub').addEventListener('click',async ()=>{
  event.preventDefault();
  const post=moment.value;
  const user_email=sessionStorage.getItem('user_email');
  if(!post) {
    console.log('Please enter a post ! ');
    return;
  }
  
  const req=await fetch('/msg',{
    method:'POST',
    headers:{
      'Content-type':'application/json'
    },
    body:JSON.stringify({
      text:`${post}`,
      category:`${cat.value}`,
      user_email:`${user_email}`
    })
  });
  fetchData();
});
  
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Check for saved user preference (from localStorage)
if (localStorage.getItem('darkMode') === 'enabled') {
  enableDarkMode();
}

// Add event listener for toggle switch
darkModeToggle.addEventListener('change', () => {
  if (darkModeToggle.checked) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
});

function enableDarkMode() {
  document.body.classList.add('dark-mode');
  document.querySelector('.header').classList.add('dark-mode');
  document.querySelector('.container').classList.add('dark-mode');
  localStorage.setItem('darkMode', 'enabled'); // Save preference
}

function disableDarkMode() {
  document.body.classList.remove('dark-mode');
  document.querySelector('.header').classList.remove('dark-mode');
  document.querySelector('.container').classList.remove('dark-mode');
  localStorage.setItem('darkMode', 'disabled'); // Save preference
}

const filt=document.getElementById('filtbycat');

filt.addEventListener('change',async ()=>{
  console.log('Selected by : ',filt.value);
  if(filt.value==='Filter by category'||filt.value==='') {
    fetchData();
    return;
  }

  const req=await fetch(`/filter?category=${encodeURIComponent(filt.value)}`);
  if(!req) {
    console.error('Could not filter by category ! ')
    return;
  }
  const resp=await req.json();
  display.innerHTML='';
  if(resp.length===0) {
    display.innerHTML='No rows found ! ';
    return;
  }
  const ue=sessionStorage.getItem('user_email');
  resp.forEach(element => {
    const del=document.createElement('button');
    del.className='del-b';
    del.textContent='Delete';
    const edit=document.createElement('button');
    edit.className='ed-b';
    edit.textContent='Edit';
    if(ue===element.email) {
    edit.addEventListener('click',async()=>{
      document.querySelector('.re-fill-div').style.display='block';
      ref.value=element.text;
      ref.dataset.id=element.id;
    });
  }
  else {
    edit.style.backgroundColor='grey';
  }
    const li=document.createElement('li');
    li.textContent=`${element.id} - ${element.text} - ${element.category} - ${element.timestamp}`;
    li.appendChild(del);
    li.appendChild(edit);
    if(ue===element.email) {
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
    });
  }
  else {
    del.style.backgroundColor='grey';
  }
    display.appendChild(li);
  });

});

document.querySelector('.ym').addEventListener('click',async ()=>{
  window.location.href='your_moment.html';
  
});

document.getElementById('profile-pic-input').addEventListener('change',async function(event) {
  event.preventDefault();
  const file=event.target.files[0];
  const prof_pic=document.getElementById('profile-pic');
  const fileNameLabel = document.getElementById('file-name');
  if(file) {
    const reader=new FileReader();
    reader.onload=function(e) {
      prof_pic.src=`${e.target.result}`;
      document.querySelector('.prof-in-div').style.display='none';
    };
    reader.readAsDataURL(file);
    fileNameLabel.textContent = `Selected: ${file.name}`;
  }
  else {
    const currentSrc = profilePic.src.split('/').pop();
    fileNameLabel.textContent = `Current: ${currentSrc || 'default-profile.png'}`;
  }

  const userEmail=sessionStorage.getItem('user_email');


    const formData=new FormData();
    formData.append('profile_pic',file);
    formData.append('email',userEmail);

    const response=await fetch('/uploadprofile',{
      method:'POST',
      body:formData,
    });
    if(response.ok) {
      alert('Profile updated and saved ! ');
    }
    else {
      alert('Failed to upload ! ');
    }

});


document.addEventListener('DOMContentLoaded',async ()=>{
  const user_email=sessionStorage.getItem('user_email');
  const profilePic=document.getElementById('profile-pic');

  if(!user_email) {
    console.log('Email not found ! ');
    return;
  }

  const response=await fetch(`/profilepic?email=${encodeURIComponent(user_email)}`);

  const data=await response.json();
  profilePic.src=`${data.profile_pic}`;
});
