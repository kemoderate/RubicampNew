var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const db = require('./db')
const socketIo = require('socket.io')


function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/')
  }
  next();
}


function requireAdmin(req, res, next){
  if (!req.session.user || req.session.user.role !== 'admin'){
    req.flash('error_msg','Access denied, Admins only')
    return res.redirect('/sales')
  }
  next()
}

 async function requireOwner(req, res, next){
   try {
    const { invoice } = req.params; // e.g. /sales/edit/:id
    const user = req.session.user; // logged in user info
    const path = req.originalUrl;

    const table = path.includes('/purchases') ? 'purchases' : 'sales';
    const redirectbase = table === 'purchases' ? '/purchases' :'/sales';

    const { rows } = await db.query(`SELECT operator FROM ${table} WHERE invoice = $1`, [invoice]);
    if (rows.length === 0) {
      req.flash('error_msg', 'Data not found');
      return res.redirect(redirectbase);
    }

    const dataOwner = rows[0].operator;

    // Compare
    if (user.id !== dataOwner) {
      req.flash('error_msg', 'Access denied, you are not owner of this data');
      return res.redirect('/sales');
    }

    next(); // user is the owner → proceed
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Internal server error');
    res.redirect('/sales');
  }
}


var app = express();

var forgetpasswordRouter = require('./routes/forgetpassword')(db)
var userloginRouter = require('./routes/userlogin');
var dashboardRouter = require('./routes/dashboard')(requireAdmin,requireLogin, db);
var usersRouter = require('./routes/users')(requireAdmin,requireLogin, db);
var unitsRouter = require('./routes/units')(requireAdmin,requireLogin, db);
var goodsRouter = require('./routes/goods')(requireAdmin,requireLogin, db);
var suppliersRouter = require('./routes/suppliers')(requireLogin, db);
var customersRouter = require('./routes/customers')(requireLogin, db);
var purchasesRouter = require('./routes/purchases')(requireOwner,requireLogin, db);
var salesRouter = require('./routes/sales')(requireOwner,requireLogin, db);
 



// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
  secret: 'rubicamp',
  resave: false,
  saveUninitialized: true,
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash('error_msg');   // pesan error
  res.locals.success = req.flash('success_msg'); // pesan success
  next();
});
app.get('/api/lowstock', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT barcode, name, stock 
      FROM goods 
      WHERE stock < 10
      ORDER BY stock ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Low stock API error:', err);
    res.status(500).json([]);
  }
});

app.use(async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT barcode, name, stock 
      FROM goods 
      WHERE stock < 10
      ORDER BY stock ASC
    `);
    res.locals.lowStockGoods = result.rows; // available in all EJS
  } catch (err) {
    console.error("Low stock middleware error:", err);
    res.locals.lowStockGoods = [];
  }
  next();
});




app.use('/forgetpassword', forgetpasswordRouter);
app.use('/dashboard', requireLogin, dashboardRouter);
app.use('/users', requireLogin, usersRouter);
app.use('/units', requireLogin, unitsRouter);
app.use('/goods', requireLogin, goodsRouter);
app.use('/suppliers', requireLogin, suppliersRouter);
app.use('/purchases', requireLogin, purchasesRouter);
app.use('/customers', requireLogin, customersRouter);
app.use('/sales', requireLogin, salesRouter);
app.use('/', userloginRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message);
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
