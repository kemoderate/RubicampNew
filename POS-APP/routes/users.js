var express = require('express');



/* GET home page. */
module.exports = (requireLogin) => {

  const router = express.Router();

  router.get('/', requireLogin, (req, res) => {
    res.render('users', {
      title: 'User',
      user: req.session.user,
      layout: 'layout'
    });
  });


  return router;
}

