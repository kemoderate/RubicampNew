var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const db = require('./db')


function requireLogin(req, res , next){
  if(!req.session.user){
    return res.redirect('/')
  }
  next();
}

var userloginRouter = require('./routes/userlogin');
var indexRouter = require('./routes/index')(requireLogin,db);
var usersRouter = require('./routes/users')(requireLogin,db);
var unitsRouter = require('./routes/units')(requireLogin,db);

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false }))

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





app.use('/dashboard',requireLogin, indexRouter);
app.use('/users',requireLogin, usersRouter);
app.use('/units',requireLogin, unitsRouter);
app.use('/', userloginRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message); 
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
