var express = require('express');
const db = require('../db')



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
    try {
      await db.query(
        'INSERT INTO users (name,password,email,role) VALUES ($1,$2,$3,$4)',
        [name, password, email, role]
      );
      res.redirect('/users')
    }
    catch (err) {
      console.error(err)
      res.status(500).send('Failed to add User')
    }
  });

  return router;
}

