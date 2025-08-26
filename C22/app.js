var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {MongoClient} = require('mongodb');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const todosRouter = require('./routes/todos');


var app = express();
const PORT = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




const main = async() =>{
  try {
    const client = new MongoClient('mongodb://127.0.0.1:27017')
    await client.connect()
    console.log('db connected')
    const db = client.db('breadsDB')

    app.use('/', indexRouter);
    app.use('/users', usersRouter(db));
    app.use('/todos', todosRouter(db));

    app.listen(PORT,()=>{
      console.log(`Listening on http://localhost:${PORT}`);
    });
  }catch(err){
    console.error('error',err)
  }

  // catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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

}
main();

