var express = require('express');
const db = require('../db')



/* GET home page. */
module.exports = (requireLogin, db) => {

  const router = express.Router();

  router.get('/', requireLogin, async (req, res) => {
    try {
      const result = await db.query('SELECT customerid, name, address, phone FROM customers ORDER BY customerid ASC');

      const customers = result.rows;


      // render EJS dan kirim data customers
      res.render('customers', {
        title: 'customers',
        customers,
        user: req.session.user,
        layout: 'layout',
      });
    } catch (err) {
      console.error(err);
      res.send('Error ' + err);
    }
  });

  router.get('/add', requireLogin, async (req, res) => {
    res.render('customer-form', {
      title: 'Add customer',
      action: '/customers/add',
      user: req.session.user,
      supplierData:{}
    })
  })
  router.post('/add', requireLogin, async (req, res) => {
    const { name, address, phone } = req.body

    if (!name) {
      req.flash('error_msg', 'name field must be filled!')
      return res.redirect('/customers/add');
    }
    try {
      await db.query(
        'INSERT INTO customers (name,address, phone) VALUES ($1,$2,$3)',
        [ name || null, address || null, phone || null]
      );
      req.flash('success_msg', 'customer has been added !')
      res.redirect('/customers')
    }
    catch (err) {
      console.error(err)
      req.flash('error_msg','Failed to add customer');
      res.redirect('/customers/add')
    }
  });

  router.get('/edit/:customerid', requireLogin, async (req, res) => {
    const { customerid } = req.params
    try {
      const { rows } = await db.query('SELECT * FROM customers WHERE customerid = $1', [customerid]);
      if (rows.length === 0) {
        req.flash('error_msg', 'customerid not found')
        return res.redirect('/customers')
      }

      res.render('customer-form', {
        title: 'Edit customer',
        action: `/customers/edit/${customerid}`,
        supplierData: rows[0],
        user: req.session.user
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error Showing Edit Form')
    }
  });

  router.post('/edit/:customerid', requireLogin, async (req, res) => {
    const { customerid } = req.params
    const { name, address,phone } = req.body

    if (!name || !address) {
      req.flash('error_msg', 'Semua field wajib diisi');
      return res.redirect(`/customers/edit/${customerid}`)
    }

    try {
      await db.query('UPDATE customers SET name=$1, address=$2, phone=$3 WHERE customerid=$4',
        [name, address, phone, customerid]
      )
      req.flash('success_msg', 'customer has been updated!')
      res.redirect('/customers')
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'failed updating customer')
      res.redirect(`/customers/edit/${customerid}`);
    }
  })

  router.get('/delete/:customerid', requireLogin, async (req, res) => {
    const { customerid } = req.params
    try {
      await db.query('DELETE FROM customers WHERE customerid = $1', [customerid])
      req.flash('success_msg','customer has been deleted!')
      res.redirect('/customers')
    } catch (err) {
      console.error(err)
      req.flash('error_msg','Failed to delete customer')
      res.redirect('/customers')
    }
  })


  return router;
}

