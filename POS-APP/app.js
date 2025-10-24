var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const db = require('./db');

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.flash('error_msg', 'Access denied, Admins only');
    return res.redirect('/sales');
  }
  next();
}

async function requireOwner(req, res, next) {
  try {
    const { invoice } = req.params;
    const user = req.session.user;
    const path = req.originalUrl;

    const table = path.includes('/purchases') ? 'purchases' : 'sales';
    const redirectbase = table === 'purchases' ? '/purchases' : '/sales';

    const { rows } = await db.query(`SELECT operator FROM ${table} WHERE invoice = $1`, [invoice]);
    if (rows.length === 0) {
      req.flash('error_msg', 'Data not found');
      return res.redirect(redirectbase);
    }

    const dataOwner = rows[0].operator;

    if (user.id !== dataOwner) {
      req.flash('error_msg', 'Access denied, you are not owner of this data');
      return res.status(403).redirect(redirectbase);
    }

    return next();
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Internal server error');
    res.redirect(redirectbase);
  }
}

var app = express();

// ===== SOCKET.IO SETUP =====
const server = require('http').createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

// Store io instance so routes can access it
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);
  socket.on('disconnect', (reason) => {
    console.log('🔴 Socket disconnected:', socket.id, 'reason:', reason);
  });
});
// ===== END SOCKET.IO SETUP =====

// Load routes
var forgetpasswordRouter = require('./routes/forgetpassword')(db);
var userloginRouter = require('./routes/userlogin');
var dashboardRouter = require('./routes/dashboard')(requireAdmin, requireLogin, db);
var usersRouter = require('./routes/users')(requireAdmin, requireLogin, db);
var unitsRouter = require('./routes/units')(requireAdmin, requireLogin, db);
var goodsRouter = require('./routes/goods')(requireAdmin, requireLogin, db);
var suppliersRouter = require('./routes/suppliers')(requireLogin, db);
var customersRouter = require('./routes/customers')(requireLogin, db);
var purchasesRouter = require('./routes/purchases')(requireOwner, requireLogin, db);
var salesRouter = require('./routes/sales')(requireOwner, requireLogin, db);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'rubicamp',
  resave: false,
  saveUninitialized: true,
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash('error_msg');
  res.locals.success = req.flash('success_msg');
  next();
});

// Low stock API endpoint
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

// Low stock middleware
app.use(async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT barcode, name, stock 
      FROM goods 
      WHERE stock < 10
      ORDER BY stock ASC
    `);
    res.locals.lowStockGoods = result.rows;
  } catch (err) {
    console.error("Low stock middleware error:", err);
    res.locals.lowStockGoods = [];
  }
  next();
});

// Routes
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
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// ===== START SERVER WITH IIFE =====
(function startServer() {
  const PORT = normalizePort(process.env.PORT || '3000');
  
  server.listen(PORT, () => {
    console.log(` Server running on: http://localhost:${PORT}`);
    console.log(` Socket.io ready for connections`);
    console.log(` Database connected`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    switch (error.code) {
      case 'EACCES':
        console.error(`❌ ${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`❌ ${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  function normalizePort(val) {
    const port = parseInt(val, 10);
    
    if (isNaN(port)) {
      return val; // named pipe
    }
    
    if (port >= 0) {
      return port; // port number
    }
    
    return false;
  }
})();
// ===== END SERVER STARTUP =====

// Export for testing purposes (optional)
module.exports = { app, server, io };