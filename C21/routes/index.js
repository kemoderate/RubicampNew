const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function (req, res) {
  res.render('register', { title: 'Register User' })
})


router.get('/login', function (req, res) {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'tolong masukan input' })
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'invalid' })
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json ({message : 'invalid'})
    }
    res.status(200).json ({message : 'login success', user: { id: user.id , email: user.email} });
  
  }catch (error){
    console.error('Login error:', error);
    res.status(500).json ({message: 'Server Error'})
  }
});


router.get('/logout', function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return next(err); // Pass error to Express error handling middleware
    }
    res.redirect('/login');
  })
})

module.exports = router;
