var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const pool = require('../db')


async function hashPasswords() {
  const { rows: users } = await pool.query('SELECT userid, password FROM users');
  for (const user of users) {
    if (!user.password.startsWith('$2b$')) { // cek kalau belum hash
      const hash = await bcrypt.hash(user.password, 10);
      await pool.query('UPDATE users SET password = $1 WHERE userid = $2', [hash, user.userid]);
      console.log(`User ${user.userid} password hashed`);
    }
  }
}
hashPasswords();


router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Login User', user: req.session.user });
});


router.post('/', async (req, res) => {

  const { email, password } = req.body

  if (!email) {
    req.flash('error_msg', 'masukan email terlebih dahulu')
    return res.redirect('/')
  } else if (!password) {
    req.flash('error_msg', 'password is wrong')
    return res.redirect('/')

  } else if (!email || !password) {
    req.flash('error_msg', ' masukan email dan password terlebih dahulu');
    return res.redirect('/')
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1',

      [email]
    );


    if (result.rows.length === 0) {
      req.flash('error_msg', 'email tidak terdaftar');
      return res.redirect('/');
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'password is wrong');
      return res.redirect('/');
    } else {
      req.session.user = { id: user.userid, email: user.email, name: user.name,       // simpan nama
        role: user.role, avatar: user.avatar };
      req.session.loggedIn = true;
      req.flash('success_msg', 'Login Berhasil')
      res.redirect('/dashboard')
    }
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'server error');
    return res.redirect('/');
  }
});




router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
});

module.exports = router;
