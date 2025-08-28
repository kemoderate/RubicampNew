const express = require('express');



module.exports = (db) => {
  const router = express.Router();
  const users = db.collection('users');
  const { ObjectId } = require('mongodb')

// render ejs
router.get('/view', async (req, res) => {
  try{
    let { page = 1, name = '' , phone = ''} = req.query;
    page = parseInt(page) || 1;
    const limit = 5
    const skip = (page - 1) * limit;

    const filter = {};
    if(name) filter.name = {$regex: name, $options: 'i'};
    if(phone) filter.phone = {$regex: phone, $options: 'i'};

    const totalUsers = await users.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers/limit);

    const data = await users.find(filter).skip(skip).limit(limit).toArray();
    res.render('users', {title: "User List",
       users: data,
      page,
      totalPages,
      query: {name, phone}
      })
  }catch(err){
    res.status(500).json({error: err.message})
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
