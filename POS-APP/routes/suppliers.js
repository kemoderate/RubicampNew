var express = require('express');
const db = require('../db')



/* GET home page. */
module.exports = (requireLogin, db) => {

  const router = express.Router();

  router.get('/', requireLogin, async (req, res) => {
    try {
      const result = await db.query('SELECT supplierid, name, address, phone FROM suppliers ORDER BY supplierid ASC');

      const suppliers = result.rows;


      // render EJS dan kirim data suppliers
      res.render('suppliers', {
        title: 'Suppliers',
        suppliers,
        user: req.session.user,
        layout: 'layout',
      });
    } catch (err) {
      console.error(err);
      res.send('Error ' + err);
    }
  });

  router.get('/add', requireLogin, async (req, res) => {
    res.render('supplier-form', {
      title: 'Add Supplier',
      action: '/suppliers/add',
      user: req.session.user,
      supplierData:{}
    })
  })
  router.post('/add', requireLogin, async (req, res) => {
    const { name, address, phone } = req.body

    if (!name) {
      req.flash('error_msg', 'name field must be filled!')
      return res.redirect('/suppliers/add');
    }
    try {
      await db.query(
        'INSERT INTO suppliers (name,address, phone) VALUES ($1,$2,$3)',
        [ name || null, address || null, phone || null]
      );
      req.flash('success_msg', 'supplier has been added !')
      res.redirect('/suppliers')
    }
    catch (err) {
      console.error(err)
      req.flash('error_msg','Failed to add supplier');
      res.redirect('/suppliers/add')
    }
  });

  router.get('/edit/:supplierid', requireLogin, async (req, res) => {
    const { supplierid } = req.params
    try {
      const { rows } = await db.query('SELECT * FROM suppliers WHERE supplierid = $1', [supplierid]);
      if (rows.length === 0) {
        req.flash('error_msg', 'supplierid not found')
        return res.redirect('/suppliers')
      }

      res.render('supplier-form', {
        title: 'Edit supplier',
        action: `/suppliers/edit/${supplierid}`,
        supplierData: rows[0],
        user: req.session.user
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error Showing Edit Form')
    }
  });

  router.post('/edit/:supplierid', requireLogin, async (req, res) => {
    const { supplierid } = req.params
    const { name, address,phone } = req.body

    if (!name || !address) {
      req.flash('error_msg', 'Semua field wajib diisi');
      return res.redirect(`/suppliers/edit/${supplierid}`)
    }

    try {
      await db.query('UPDATE suppliers SET name=$1, address=$2, phone=$3 WHERE supplierid=$4',
        [name, address, phone, supplierid]
      )
      req.flash('success_msg', 'supplier has been updated!')
      res.redirect('/suppliers')
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'failed updating supplier')
      res.redirect(`/suppliers/edit/${supplierid}`);
    }
  })

  router.get('/delete/:supplierid', requireLogin, async (req, res) => {
    const { supplierid } = req.params
    try {
      await db.query('DELETE FROM suppliers WHERE supplierid = $1', [supplierid])
      req.flash('success_msg','supplier has been deleted!')
      res.redirect('/suppliers')
    } catch (err) {
      console.error(err)
      req.flash('error_msg','Failed to delete supplier')
      res.redirect('/suppliers')
    }
  })


  return router;
}

