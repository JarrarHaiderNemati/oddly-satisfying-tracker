const express=require('express');
const app=express();
const path=require('path');
const bcrypt=require('bcrypt');
const multer=require('multer');
const mysql=require('mysql2');
const nodemailer=require('nodemailer');
require('dotenv').config();
const PORT=3000;

app.use(express.json());
app.use('/uploads',express.static('uploads'));

app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname,'public','login.html'));
});

app.use(express.static(path.join(__dirname,'public')));

const db=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'',
  database:'odd'
});

db.connect((err)=>{
  if(err) {
    console.error('Error connecting to db ',err.message);
    return;
  }
  console.log('Connected to DB ! ');
});

const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'uploads/')
  },
  filename:(req,file,cb)=>{
    const uniqueSuffix=Date.now()+'-'+ Math.round(Math.random()*1e9);
    cb(null,uniqueSuffix + '-' + file.originalname);
  },
});

const upload=multer({storage:storage});


app.get('/msg',(req,res)=>{
  const sql='SELECT moments.id, moments.text, moments.category, moments.timestamp, users.full_name, users.email FROM moments LEFT JOIN users ON moments.user_email = users.email';

  db.query(sql,(err,result)=>{
    if(err) {
      return res.status(500).send('Error fetching data ! ');
    }
    res.status(200).json(result);
  });
});

app.post('/msg', (req, res) => {
  const { text, category,user_email } = req.body;

  if (!text || !category||!user_email) {
    return res.status(400).send('Enter both text and category, please!');
  }

  // Step 1: Find the lowest available ID
  const findLowestId = `
    SELECT COALESCE(MIN(t1.id + 1), 1) AS lowest_available_id
    FROM moments t1
    LEFT JOIN moments t2 ON t1.id + 1 = t2.id
    WHERE t2.id IS NULL;
  `;

  db.query(findLowestId, (err, result) => {
    if (err) {
      console.error('Error finding the lowest available ID!', err);
      return res.status(500).send('Error finding the lowest available ID.');
    }

    const newId = result[0].lowest_available_id; // Get the lowest available ID

    // Step 2: Insert the new record with the calculated ID
    const insertMoment = 'INSERT INTO moments (id, text, category,user_email) VALUES (?, ?, ?,?)';
    db.query(insertMoment, [newId, text, category,user_email], (insertErr, insertResult) => {
      if (insertErr) {
        console.error('Error inserting new moment!', insertErr);
        return res.status(500).send('Not able to insert the moment!');
      }

      res.status(201).json({
        message: `Moment added successfully!`,
        id: newId, // Return the assigned ID
      });
    });
  });
});

app.delete('/msg',(req,res)=>{
 
  const {nem}=req.body;

  if(!nem) {
    return res.status(500).send('Enter name plz ! ');
  }

  const sql='DELETE FROM moments WHERE text=?';
  db.query(sql,[nem],(err,result)=>{
    if(err) {
      console.error('Error deleting from DB ! ');
      return;
    }

    if(result.affectedRows===0) {
      console.log('Moment not found ! ');
      return;
    }

    const setNewIdQuery = 'SET @new_id = 0;';
    db.query(setNewIdQuery, (setErr) => {
      if (setErr) {
        console.error('Error setting new ID variable!', setErr);
        return res.status(500).send('Error setting new ID variable.');
      }

      // Step 3: Reorder the IDs
      const reorderQuery = 'UPDATE moments SET id = (@new_id := @new_id + 1) ORDER BY id;';
      db.query(reorderQuery, (reorderErr) => {
        if (reorderErr) {
          console.error('Error reordering IDs!', reorderErr);
          return res.status(500).send('Error reordering IDs.');
        }

        res.status(200).send('Record deleted and IDs reordered.');
      });
    });
  });

});

app.put('/msg/:id',(req,res)=>{
  const{id}=req.params;
  const {text,category}=req.body;

  if(!text) {
    return res.status(400).send('Enter text please!');
  }

  const sql='UPDATE moments SET text=?, category=? WHERE id=?';
  db.query(sql,[text,category,id],(err,result)=>{
    if(err) {
      console.error('Unable to update ! ');
      return;
    }

    if(result.affectedRows===0) {
      console.log('Unable to find the moment ! ');
      return;
    }
    const fetchUpdated = 'SELECT * FROM moments WHERE id = ?';
        db.query(fetchUpdated, [id], (fetchErr, rows) => {
            if (fetchErr || rows.length === 0) {
                return res.status(500).send('Error fetching updated data!');
            }

            res.status(200).json(rows[0]); // Return the updated moment
        });
  });
});

app.get('/search',(req,res)=>{
  const {query}=req.query;

  if(!query) {
    const sql='SELECT * FROM moments';
    db.query(sql,(err,result)=>{
      if(err) {
        console.error('Error retrieving info ! ');
        return;
      }
      return res.json(result);
    });
  }
  else {
    const sql='SELECT * FROM moments WHERE text LIKE ?';
    const searchquery=`%${query}%`;

    db.query(sql,[searchquery],(err,result)=>{
      if(err) {
        console.error('Error fetching data ! ');
        return;
      }
      return res.json(result);
    });
  }
});

app.post('/signup',async (req,res)=>{
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const{fullname,email,password}=req.body;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format!' });
}
  const checker='SELECT full_name FROM users WHERE email=?';
  db.query(checker,[email],(err,result)=>{
    if(err){
      console.error('Some error occured ! ');
      return;
    }
    if(result.length>0) {
      console.error('User already exists ! ');
      return;
    }
  });
  const hashPass=await bcrypt.hash(password,10);
  const sql='INSERT INTO users(email,full_name,password) VALUES(?,?,?)';
  db.query(sql,[fullname,email,hashPass],(err,result)=>{
    if(err) {
      console.error('Unable to insert');
      return;
    }
    if (result.affectedRows > 0) {
      return res.status(201).json({ message: 'User registered successfully!' });
    } else {
      
      return res.status(500).json({ error: 'Failed to insert user.' });
      
    }
  });
});

app.post('/login',(req,res)=>{
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const {email,password}=req.body;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format!' });
}
  if(!email||!password) {
    return res.status(400).json({error:'Enter both email and pass ! '});
  }

  const sql='SELECT * FROM users WHERE email=?';
  db.query(sql,[email],async (err,result)=>{
    if(err) {
      return res.status(500).json({error:'Database error ! '});
    }
    if(result.length===0) {
      return res.status(404).json({error:'No such user exists !'});
    }
    const isPass=await bcrypt.compare(password,result[0].password);
    if (!isPass) {
      return res.status(401).json({ error: 'Invalid credentials!' });
    }

    // If login is successful
    return res.status(200).json({ message: 'Login successful!' });
  });
});

app.get('/filter',(req,res)=>{
  const val=req.query.category;
  if(!val) {
    return res.status(400).json({error:'Please enter category ! '});
  }
  const sql='SELECT * FROM moments WHERE category LIKE ? ';

  const cart=`%${val}%`;
  
  db.query(sql,[cart],(err,result)=>{
    if(err) {
      return res.status(500).json({error:'Could not retrieve info ! '});
    }

    if(result.length===0) {
      return res.status(404).json({error:'Could not filter by category ! '});
    }
    return res.status(200).json(result);
  });
});

app.post('/yourMoment',(req,res)=>{
  const u_em=req.body.userEm;
  const sql='SELECT * FROM moments JOIN users ON moments.user_email=users.email WHERE users.email=?';

  db.query(sql,[u_em],(err,result)=>{
    if(err) {
      return res.status(500).json({error:'Error retrieving info ! '});
    }
    if(result.length===0) {
      return res.status(404).json({error:'You have no moments ! '});
    }
    return res.status(201).json(result);
  })
});

app.put('/ymEdit/:id',(req,res)=>{
  const{id}=req.params;
  const {text,category}=req.body;

  if(!text) {
    return res.status(400).send('Enter text please!');
  }

  const sql='UPDATE moments SET text=?, category=? WHERE id=?';
  db.query(sql,[text,category,id],(err,result)=>{
    if(err) {
      console.error('Unable to update ! ');
      return;
    }

    if(result.affectedRows===0) {
      console.log('Unable to find the moment ! ');
      return;
    }
    const fetchUpdated = 'SELECT * FROM moments WHERE id = ?';
        db.query(fetchUpdated, [id], (fetchErr, rows) => {
            if (fetchErr || rows.length === 0) {
                return res.status(500).send('Error fetching updated data!');
            }

            res.status(200).json(rows[0]); // Return the updated moment
        });
  });
});

app.post('/uploadprofile',upload.single('profile_pic'),(req,res)=>{
  const userEmail=req.body.email;
  const filePath=req.file.path;

  console.log(req.file.path);

  if(!userEmail||!filePath) {
    return res.status(400).send('Both email and file path are required ! ');
  }

  const sql='UPDATE users SET profile_pic = ? WHERE email= ? ';
  db.query(sql,[filePath,userEmail],(err,result)=>{
    if(err) {
      return res.status(500).send('Error updating directory in DB ! ');
    }
    res.status(200).json({ message: 'Profile picture updated successfully!', profile_pic: filePath });
  })
});

app.get('/profilepic',(req,res)=>{
    const userEmail=req.query.email;
    if(!userEmail) {
      return res.status(400).send('Email needed ! ');
    }
    const sql='SELECT profile_pic FROM users WHERE email = ? ';
    db.query(sql,[userEmail],(err,result)=>{
      if(err) {
        return res.status(500).send('Failed to retrieve picture from DB ! ');
      }
      if(result.length===0) {
        return res.status(404).send('No profile pic found ! ');
      }
      const prof=result[0].profile_pic;
      return res.status(200).json({profile_pic:prof});
    });
});

app.listen(PORT,()=>{
  console.log('Server started ! ');
})