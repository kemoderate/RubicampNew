var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.send('Hello from Index Route!');
});

module.exports = router;
