const express = require('express');
const router = express.Router();
const session = require('express-session');
const app = express();


app.use(session({
    secret: 'your_secret_key', // Replace with a strong, secret key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // Example: 1 hour
}));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function (req, res) {
  res.render('register', { title: 'Register User' })
})


router.get('/login', function (req, res) {
  const {username , password }= req.body
  if ( username === 'user' && password === 'pass')
    req.session.userid
  res.render('login', { title: 'Register User' })
})


router.get('/logout', function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return next(err); // Pass error to Express error handling middleware
    }
    res.redirect('/login');
  })
})

module.exports = router;
