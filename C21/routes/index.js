const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const saltRounds = 10;



/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    // Ambil query params + default op = AND
    let { id, string, startdate, enddate, boolean, page, op = 'AND' } = req.query;

    // Ambil data session user
    const userSession = req.session.user || null;
    let userId = userSession ? userSession.id : null;

    // Pagination setup
    page = parseInt(page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    // Filter awal: hanya data milik user yang sedang login
    let filters = [`userid = $1`];
    let params = [userId];

    // Ambil data user untuk ditampilkan di view
    let user = null;
    if (userSession) {
      const { rows: userRows } = await pool.query(
        'SELECT id, email, avatar FROM users WHERE id = $1',
        [userSession.id]
      );
      user = userRows[0];
    }

    // Pastikan operator hanya AND / OR
    const operator =
      (op && (op.toUpperCase() === 'OR' || op.toUpperCase() === 'AND'))
        ? ` ${op.toUpperCase()} `
        : 'AND';

    // Kumpulan filter tambahan untuk todos
    let Todosfilter = [];

    if (id) {
      Todosfilter.push(`id = $${params.length + 1}`);
      params.push(id);
    }

    if (string) {
      Todosfilter.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${string}%`);
    }

    if (startdate && enddate) {
      Todosfilter.push(`deadline BETWEEN $${params.length + 1} AND $${params.length + 2}`);
      params.push(startdate, enddate);
    } else if (startdate) {
      Todosfilter.push(`deadline >= $${params.length + 1}`);
      params.push(startdate);
    } else if (enddate) {
      Todosfilter.push(`deadline <= $${params.length + 1}`);
      params.push(enddate);
    }

    if (boolean === 'true') {
      Todosfilter.push(`complete = $${params.length + 1}`);
      params.push(true);
    } else if (boolean === 'false') {
      Todosfilter.push(`complete = $${params.length + 1}`);
      params.push(false);
    }

    // 🔹 Gabungkan filter awal (userid) + filter todos
    let where;
    if (Todosfilter.length > 0) {
      where = `WHERE ${filters.join(operator)} AND (${Todosfilter.join(operator)})`;
    } else {
      where = `WHERE ${filters.join(operator)}`;
    }

    // Query hitung total data
    let countQuery = `SELECT COUNT(*) as count FROM todos ${where}`;

    // Query ambil data + pagination
    let dataQuery = `SELECT * FROM todos ${where} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    // Jalankan query count
    const countResult = await pool.query(countQuery, params);
    let totalRows = countResult.rows[0].count;
    let totalPages = Math.ceil(totalRows / limit);

    // Buat base URL untuk pagination agar filter tetap aktif
    const queryWithoutPage = { ...req.query };
    delete queryWithoutPage.page;
    const queryString = new URLSearchParams(queryWithoutPage).toString();
    const baseUrl = `/?${queryString}`;

    // Jalankan query data
    const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

    // Tambahkan nomor urut untuk tabel
    dataResult.rows.forEach((todo, index) => {
      todo.nomor_urut = offset + index + 1;

      if(todo.deadline){
        const dateObj = new Date (todo.deadline);
        todo.deadline_formatted = dateObj.toLocaleDateString('id-ID',{
          year : 'numeric',
          month : '2-digit',
          day : '2-digit',
          hour : '2-digit',
          minute : '2-digit',
          second : '2-digit',
          hour12 : false
        });
      } else {
        todo.deadline_formatted = '';
      }
    });
    

    // Render ke view
    res.render('index', {
      title: 'PostgreSQL BREADS (Browse, Read, Edit, Add, Delete, Sort) and Pagination',
      data: dataResult.rows,
      query: req.query,
      page,
      totalPages,
      url: baseUrl,
      user: req.session.user || null
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
    req.flash('error_msg', 'user sudah terdaftar. coba yang lain');
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
      req.session.user = { id: user.id, email: user.email, avatar: user.avatar };
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


router.get('/add', function (req, res) {
  res.render('add', { title: 'Add list' })
})


router.post('/add', async (req, res) => {
  const { title } = req.body
  const userid = req.session.user.id;

  try {
    const now = new Date();
    now.setDate(now.getDate()+ 1);

    await pool.query(`INSERT INTO todos (title, complete , deadline, userid) VALUES ($1, false, $2, $3)`,
      [title, now, userid]
    );
    
    req.flash('success_msg', 'List Baru Berhasil di tambahkan');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal menambahkan List');
    res.redirect('/add')
  }
})

router.get('/edit/:id', async function (req, res) {
  userid = req.session.user.id;
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT id , title, complete, deadline FROM todos WHERE id = $1 AND userid = $2`,
      [id, userid]
    );
    if (rows.length === 0) {
      req.flash('error_msg', 'List tidak ditemukan')
      return res.redirect('/')
    }
    const todo = rows[0]
    const deadlineDate = new Date(todo.deadline);
    const deadlineYYYYMMDD = isNaN(deadlineDate)
      ? ''
      : deadlineDate.toISOString().slice(0, 10)
    res.render('edit', {
      title: 'Edit list',
      todo,
      deadlineYYYYMMDD
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal mengambil data list')
  }

})

router.post('/edit/:id', async (req, res) => {
  const userid = req.session.user.id;
  const { id } = req.params
  const { title, complete, deadline } = req.body;

  const completeValue = complete === 'on';

  try {
    const result = await pool.query(
      `Update todos 
      SET title = $1, complete = $2, deadline = $3
      WHERE id = $4 AND userid = $5`,
      [title, completeValue, deadline, id, userid]
    );
    if (result.rowCount === 0) {
      req.flash('error_msg', 'list tidak ditemukan atau bukan milik anda')
      return res.redirect('/');
    }
    req.flash('success_msg', 'list berhasil diperbarui');
    res.redirect('/');
  } catch (err) {
    console.error(err)
    req.flash('error_msg', 'Gagal memperbarui list');
    res.redirect(`/edit/${id}`);
  }
})

router.post('/delete/:id', async (req, res) => {
  const id = req.params.id;
  const userid = req.session.user.id

  try {
    await pool.query('DELETE FROM todos WHERE id = $1 AND userid = $2', [id, userid]);
    req.flash('success_msg', 'todo berhasil dihapus')
    res.redirect('/');
  } catch (err) {
    req.flash('error', 'Gagal menghapus todo')
    res.redirect('/')
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
