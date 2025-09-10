var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login',
    layout: 'layout'
   });
});

router.get('/dashboard', function(req, res, next) {
  res.render('index', { title: 'Dashboard',
    layout: 'layout'
   });
});

router.get('/users', (req, res) => {
  res.render('users'); // otomatis cari file views/users.ejs
});


module.exports = router;
