const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const saltRounds = 10;



/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    let { id, string, startdate, enddate, boolean, page, op } = req.query;
   const user = req.session.user || null;

    page = parseInt(page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;


    let filters = [];
    let params = [];

    if (id) {
      filters.push(`id = $${params.length + 1}`);
      params.push(id);
    }

    if (string) {
      filters.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${string}%`);
    }
    if (startdate && enddate) {
      filters.push(`deadline BETWEEN  $${params.length + 1} AND $${params.length + 2}`);
      params.push(startdate, enddate);
    } else if (startdate) {
      filters.push(`deadline >= $${params.length + 1}`);
      params.push(startdate);
    } else if (enddate) {
      filters.push(`deadline <= $${params.length + 1}`);
      params.push(enddate);
    }

    if (boolean === 'true') {
      filters.push(`complete = $${params.length + 1}`);
      params.push(true);
    } else if (boolean === 'false') {
      filters.push(`complete = $${params.length + 1}`);
      params.push(false);
    }

    const operator = (op && (op.toUpperCase() === 'OR' || op.toUpperCase() === 'AND')) ? ` ${op.toUpperCase()} ` : 'AND';
    let where = filters.length ? `WHERE ${filters.join(operator)}` : '';

    let countQuery = `SELECT COUNT(*) as count FROM todos ${where}`;
    let dataQuery = `SELECT * FROM todos ${where} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;


const countResult = await pool.query(countQuery, params,);

      let totalRows = countResult.rows[0].count;
      let totalPages = Math.ceil(totalRows / limit);

      const queryWithoutPage = { ...req.query };
      delete queryWithoutPage.page;

      // Buat URL base untuk pagination
      const fullQuery = { ...req.query, page: undefined };
      const queryString = new URLSearchParams(queryWithoutPage).toString();
      const baseUrl = `/?${queryString}`;

      const url = req.url == '/' ? '/?page=1' : req.url


const dataResult =  await pool.query(dataQuery, [...params, limit, offset]);
        res.render('index', {
          title: 'PostgreSQL BREADS (Browse,Read,Edit,Add,Delete,Sort) and Pagination',
          data: dataResult.rows,
          query: req.query,
          page,
          totalPages,
          url: baseUrl,
          user
        });
      
    } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
 });
  



    router.get('/register', function (req, res) {
  res.render('register', { title: 'Register User' })
})

    router.post('/register', async (req, res) => {
  try {
    const { email, password, repassword } = req.body;
    if (!email || !password) {
      req.flash('error_msg', 'Tolong masukan email dan password');
      return res.redirect('/register');
    }
    if (repassword !== password) {
      req.flash('error_msg', 'password tidak sama');
      return res.redirect('/register');
    }
    const plainPassword = password;
    const hash = await bcrypt.hash(plainPassword, saltRounds);


    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hash]
    );

    res.redirect('/login')
  }
  catch (err) {
    console.error(err);
    req.flash('error_msg', 'terjadi kesalahan');
    return res.redirect('/register');
  }
});




router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login User' });
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    req.flash('error_msg', ' masukan email atau password terlebih dahulu');
    return res.redirect('/login');
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      req.flash('error_msg', 'email is invalid');
      return res.redirect('/login');
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'password is invalid');
      return res.redirect('/login');
    } else {
      req.session.user = { id: user.id, email: user.email };
      req.session.loggedIn = true;
      req.flash('success_msg', 'Login Berhasil')
      res.redirect('/')
    }
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'server error');
    return res.redirect('/login');
  }
});


router.post('/logout', function (req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return next(err); // Pass error to Express error handling middleware
    }
    res.redirect('/login');
  })
})

module.exports = router;
