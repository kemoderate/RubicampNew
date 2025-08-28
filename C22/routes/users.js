const express = require('express');



module.exports = (db) => {
  const router = express.Router();
  const users = db.collection('users');
  const { ObjectId } = require('mongodb')

// render ejs
router.get('/view', async (req, res) => {
  try{
    const data = await users.find().toArray()
    res.render('users', {title: "User List", users: data})
  }catch(err){
    res.status(500).json({errpr: err.message})
  }
})


  // tampil data
  router.get('/', async (req, res) => {
    try {
      const data = await users.find().toArray();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // get by id

  router.get('/:id', async (req, res) => {
    try {
      const user = await users.findOne({ _id: new ObjectId(req.params.id) })
      if (!user) return res.status(404).json({ error: 'User not found' })
      res.json(user)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })


  // create
  router.post('/', async (req, res) => {
    try {
      const { name, phone } = req.body;
      const result = await users.insertOne({ name, phone });
      res.status(201).json(result);
    }
    catch (err) {
      res.status(500).json({ error: err.message })
    }
  });



  router.put('/:id', async (req, res) => {
    try {
      const { name, phone } = req.body;
      const result = await users.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { name, phone } }
      )

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'User not Found' })
      }

      res.json({ message: 'User updated' })

    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  });


  router.delete('/:id', async (req, res) => {
    try {
      const result = await users.deleteOne({ _id: new ObjectId(req.params.id) })
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'user not found' })

      }
      res.json({ message: 'user deleted' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })


  return router;
};
