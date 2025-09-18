var express = require('express');
const db = require('../db')



/* GET home page. */
module.exports = (requireLogin, db) => {

  const router = express.Router();

  router.get('/', requireLogin, async (req, res) => {
    try {
      const result = await db.query('SELECT unit, name, note FROM units ORDER BY unit ASC');

      const units = result.rows;


      // render EJS dan kirim data units
      res.render('units', {
        title: 'Units',
        units,
        user: req.session.user,
        layout: 'layout'
      });
    } catch (err) {
      console.error(err);
      res.send('Error ' + err);
    }
  });

  router.get('/add', requireLogin, async (req, res) => {
    res.render('unit-form', {
      title: 'Add User',
      action: '/units/add',
      unitData: {},
      user: req.session.user

    })
  })
  router.post('/add', requireLogin, async (req, res) => {
    const { unit, name, note } = req.body

    if (!unit || !name || !note) {
      return res.status(400).send('Semua field wajib diisi!');
    }
    try {
      await db.query(
        'INSERT INTO units (unit,name,note) VALUES ($1,$2,$3)',
        [unit, name, note]
      );
      res.redirect('/units')
    }
    catch (err) {
      console.error(err)
      res.status(500).send('Failed to add User')
    }
  });

  router.get('/edit/:id', requireLogin, async (req, res) => {
    const { id } = req.params
    try {
      const { rows } = await db.query('SELECT * FROM units WHERE unit = $1', [id]);
      if (rows.length === 0) return res.status(404).send('User Not Found')
      res.render('unit-form', {
        title: 'Edit unit',
        action: `/units/edit/${id}`,
        unitData: rows[0],
        user: req.session.user,
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error Showing Edit Form')
    }
  });

  router.post('/edit/:id', requireLogin, async (req, res) => {
    const { id } = req.params
    const { unit, name ,note } = req.body
    try {
      await db.query('UPDATE units SET unit=$1, name=$2, note=$3 WHERE unit=$5',
        [unit, name ,note]
      )
      res.redirect('/units')
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to update user')
    }
  })

  router.get('/delete/:id', requireLogin, async (req, res) => {
    const { id } = req.params
    try {
      await db.query('DELETE FROM units WHERE userid = $1', [id])
      res.redirect('/units')
    } catch (err) {
      console.error(err)
      res.status(500).send('Failed to delete user')
    }
  })


  return router;
}

