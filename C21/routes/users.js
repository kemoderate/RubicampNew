const express = require('express');
const router = express.Router();
const pool = require('../db'); // koneksi db
const path = require('path');

// GET form upload avatar
router.get('/avatar', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('users', { user: req.session.user });
});

// POST upload avatar
router.post('/avatar', async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).send('Tidak ada file yang diupload');
    }

    const avatar = req.files.avatar;
  
    const uniqueName = Date.now() + '-' + avatar.name;
    const uploadPath = path.join(__dirname, '../public/uploads', uniqueName);

    await avatar.mv(uploadPath);

    const userId = req.session.user.id;
    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [uniqueName, userId]);

    req.session.user.avatar = uniqueName; // update session
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal upload avatar');
  }
});

module.exports = router;
