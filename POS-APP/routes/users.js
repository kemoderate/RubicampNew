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

    if (!email || !name || !password || !role) {
      return res.status(400).send('Semua field wajib diisi!');
    }
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

  router.post('edit/id', requireLogin, async (req, res) => {
    const { id } = req.params
    const { name, email, password, role } = req.body
    try {
      await db.query('UPDATE users SET name=$1, email=$2, role=$3 WHERE userid=$4',
        [name, email, password, role]
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


  return router;
}

