const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const port = 3000;

const indexRoutes = require('/.routes/index');


app.set ('view engine','ejs');
app.set ('views',path.join(__dirname,'views'));

app.use (express.urlencoded({ extended: true }));
app.use (express.json())
app.use (fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'secretcode', // bisa diganti
  resave: false,
  saveUninitialized: true
}));
app.use(flash());


app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Routes
app.use('/', indexRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
