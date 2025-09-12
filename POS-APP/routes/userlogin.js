var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')

const users = [
  {
    id: 1,
    username: 'admin@gmail.com',
    password: bcrypt.hashSync('12345', 10) // hashed password
  }
];

router.get('/', function (req, res, next) {
  res.render('login', {
    title: 'Login',
    
  });
});

router.post('/', async (req, res,) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    req.flash('error', 'invalid username or password')
    return res.redirect('/');
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    req.flash('error', 'invalid username or password')
    return res.redirect('/');
  }
  req.session.user = { id: user.id, username: user.username }

  res.redirect('/dashboard')

})

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login')
  })
});

module.exports = router;
