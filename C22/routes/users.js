const express = require('express');

module.exports = (db) => {
  const router = express.Router();
  const users = db.collection('users');

  router.get('/', async (req, res) => {
    try {
      const data = await users.find().toArray();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
