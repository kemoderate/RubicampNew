var express = require('express');
const db = require('../db')



/* GET home page. */
module.exports = (requireLogin,db) => {

  const router = express.Router();

  router.get('/', requireLogin, async (req, res) => {
    try {
      const result = await db.query('SELECT userid, name, email, role FROM users ORDER BY userid ASC');
      const users = result.rows;

      // render EJS dan kirim data users
      res.render('users', {
        title: 'Users',
        users,
        user: req.session.user,
        layout: 'layout'
      });
    } catch (err) {
      console.error(err);
      res.send('Error ' + err);
    }
  });


  return router;
}

