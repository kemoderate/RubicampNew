var express = require('express');
const db = require('../db')



/* GET home page. */
module.exports = (requireAdmin,requireLogin, db) => {

  const router = express.Router();

  router.get('/', requireAdmin,requireLogin, async (req, res) => {
    try {
      const result = await db.query('SELECT unit, name, note FROM units ORDER BY unit ASC');

      const units = result.rows;


      // render EJS dan kirim data units
      res.render('units', {
        title: 'Units',
        units,
        user: req.session.user,
        layout: 'layout',
      });
    } catch (err) {
      console.error(err);
      res.send('Error ' + err);
    }
  });

  router.get('/add', requireAdmin,requireLogin, async (req, res) => {
    res.render('unit-form', {
      title: 'Add Unit',
      action: '/units/add',
      unitData: {},
      user: req.session.user
    })
  })
  router.post('/add', requireAdmin,requireLogin, async (req, res) => {
    const { unit, name, note } = req.body

    if (!unit) {
      req.flash('error_msg', 'Unit field must be filled!')
      return res.redirect('/units/add');
    }
    try {
      await db.query(
        'INSERT INTO units (unit,name,note) VALUES ($1,$2,$3)',
        [unit, name || null, note || null]
      );
      req.flash('success_msg', 'unit has been added !')
      res.redirect('/units')
    }
    catch (err) {
      console.error(err)
      req.flash('error_msg','Failed to add unit');
      res.redirect('/units/add')
    }
  });

  router.get('/edit/:unit', requireAdmin,requireLogin, async (req, res) => {
    const { unit } = req.params
    try {
      const { rows } = await db.query('SELECT * FROM units WHERE unit = $1', [unit]);
      if (rows.length === 0) {
        req.flash('error_msg', 'Unit not found')
        return res.redirect('/units')
      }

      res.render('unit-form', {
        title: 'Edit unit',
        action: `/units/edit/${unit}`,
        unitData: rows[0],
        user: req.session.user
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error Showing Edit Form')
    }
  });

  router.post('/edit/:unit', requireAdmin,requireLogin, async (req, res) => {
    const { unit } = req.params
    const { name, note } = req.body

    if (!name || !note) {
      req.flash('error_msg', 'Semua field wajib diisi');
      return res.redirect(`/units/edit/${unit}`)
    }

    try {
      await db.query('UPDATE units SET name=$1, note=$2 WHERE unit=$3',
        [name, note, unit]
      )
      req.flash('success_msg', 'Unit has been updated!')
      res.redirect('/units')
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'failed updating Unit')
      res.redirect(`/units/edit/${unit}`);
    }
  })

  router.get('/delete/:unit', requireAdmin,requireLogin, async (req, res) => {
    const { unit } = req.params
    try {
      await db.query('DELETE FROM units WHERE unit = $1', [unit])
      req.flash('success_msg','unit has been deleted!')
      res.redirect('/units')
    } catch (err) {
      console.error(err)
      req.flash('error_msg','Failed to delete Unit')
      res.redirect('/units')
    }
  })


  return router;
}

