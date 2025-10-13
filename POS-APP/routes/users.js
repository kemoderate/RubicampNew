var express = require('express');
const db = require('../db')
const bcrypt = require('bcrypt')


/* GET home page. */
module.exports = (requireLogin, db) => {


  const router = express.Router();

  router.get('/', requireLogin, async (req, res) => {
    try {
      const result = await db.query('SELECT userid, name, email, role FROM users ORDER BY userid ASC');

      const users = result.rows;


      // render EJS dan kirim data users
      res.render('users', {
        title: 'Users',
        users,
        user: req.session.user,
        layout: 'layout'
      });
    } catch (err) {
      console.error(err);
      res.send('Error ' + err);
    }
  });

  router.get('/add', requireLogin, async (req, res) => {
    res.render('user-form', {
      title: 'Add User',
      action: '/users/add',
      userData: {},
      user: req.session.user

    })
  })
  router.post('/add', requireLogin, async (req, res) => {
    const { name, password, email, role } = req.body

    if (!email || !name || !password || !role) {
      return res.status(400).send('Semua field wajib diisi!');
    }
    try {
      await db.query(
        'INSERT INTO users (name,password,email,role) VALUES ($1,$2,$3,$4)',
        [name, password, email, role]
      );
      req.flash('success_msg', 'user berhasil di tambahkan')
      res.redirect('/users')
    }
    catch (err) {
      console.error(err)
      res.status(500).send('Failed to add User')
    }
  });

  router.get('/edit/:id', requireLogin, async (req, res) => {
    const { id } = req.params
    try {
      const { rows } = await db.query('SELECT * FROM users WHERE userid = $1', [id]);
      if (rows.length === 0) return res.status(404).send('User Not Found')
      res.render('user-form', {
        title: 'Edit user',
        action: `/users/edit/${id}`,
        userData: rows[0],
        user: req.session.user,
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error Showing Edit Form')
    }
  });

  router.post('/edit/:id', requireLogin, async (req, res) => {
    const { id } = req.params
    const { name, email, password, role } = req.body
    try {
      await db.query('UPDATE users SET name=$1, email=$2, password=$3,role=$4 WHERE userid=$5',
        [name, email, password, role, id]
      )
      res.redirect('/users')
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to update user')
    }
  })

  router.get('/delete/:id', requireLogin, async (req, res) => {
    const { id } = req.params
    try {
      await db.query('DELETE FROM users WHERE userid = $1', [id])
      res.redirect('/users')
    } catch (err) {
      console.error(err)
      res.status(500).send('Failed to delete user')
    }
  })


  router.get('/profile', requireLogin, async (req, res) => {

    try {
      const userSession = req.session.user;
      const userid = userSession.id;
      const { rows } = await db.query('SELECT * FROM users WHERE userid = $1', [userid]);

      res.render('profile-form', {
        title: 'Profile',
        action: `/users/profile/${userid}`,
        userData: rows[0],
        users: userSession,
        user: req.session.user,
        layout: 'layout'
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error Showing Edit Form')
    }
  });

  router.post('/profile/:id', requireLogin, async (req, res) => {
    const { name, email } = req.body;
    const { id } = req.params;
    try {
      await db.query(
        'UPDATE users SET name=$1, email=$2 WHERE userid=$3',
        [name, email, id]
      );
      req.flash('success_msg', 'profile successfully updated')
      res.redirect('/users/profile');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'profile cannot be updated');
    }
  });


  router.get('/changepassword', requireLogin, async (req, res) => {
    const userSession = req.session.user
    const userid = userSession.id
    const password = userSession.password
    try {
      await db.query('SELECT * FROM users WHERE userid = $1 ', [userid])
      res.render('changepassword-form', {
        title: 'Change Password',
        user: req.session.user,
        action: `/users/changepassword/${userid}`,
        layout: 'layout'
      })
    } catch (err) {
      console.error(err)
      req.flash('error_msg', err)
      res.redirect('/users/changepassword')
    }
  })


  router.post('/changepassword/:id', requireLogin, async (req, res) => {
    const userSession = req.session.user;
    const userid = userSession.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    try {

      if (!oldPassword || !newPassword || !confirmPassword) {
        req.flash('error_msg', 'All password fields are required.');
        return res.redirect('/users/profile');
      }
      if (newPassword !== confirmPassword) {
      req.flash('error_msg', 'New password and confirmation do not match.');
      return res.redirect('/users/profile');
    }
     const { rows } = await db.query('SELECT password FROM users WHERE userid = $1', [userid]);
    if (rows.length === 0) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/users/profile');
    }

    const currentHashedPassword = rows[0].password;

    
    const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isMatch) {
      req.flash('error_msg', 'Old password is incorrect.');
      return res.redirect('/users/profile');
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

      await db.query('UPDATE users SET password = $1 WHERE userid = $2',
        [hashedPassword,userid])
    } catch (err) {
      console.error(err)
      req.flash('error_msg', 'server error');
    }
  })

  return router;
}

