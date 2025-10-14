var express = require('express');
const db = require('../db')
const bcrypt = require('bcrypt')



module.exports = (db) => {


  const router = express.Router();


// GET form
router.get('/', (req, res) => {
  res.render('forgetpassword', { title: 'Forgot Password', message: null });
});

// POST reset
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.render('forgetpassword', {
      title: 'Forgot Password',
      message: 'Please enter your email address.',
    });
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.render('forgetpassword', {
        title: 'Forgot Password',
        message: 'Email not found.',
      });
    }

    // generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

    // show message (in real app: send via email)
    res.render('forgetpassword', {
      title: 'Forgot Password',
      message: `Your temporary password is: ${tempPassword}. Please log in and change it.`,
    });
  } catch (err) {
    console.error(err);
    res.render('forgetpassword', {
      title: 'Forgot Password',
      message: 'Server error. Please try again.',
    });
  }
});

return router;
}
