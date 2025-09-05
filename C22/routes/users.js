const express = require('express');



module.exports = (db) => {
  const router = express.Router();
  const users = db.collection('users');
  const { ObjectId } = require('mongodb')



  // tampil data
  router.get('/', async (req, res) => {
    try {
      let { page = 1, search = '',
        sortBy = 'name',
        sortMode = 'asc',
        limit = 5
      } = req.query;
      page = parseInt(page) || 1;
      limit = limit === 'all' ? 0 : parsetInt(limit) || 5;
      const skip = limit === 0 ? 0 : (page - 1) * limit;

      let filter = {};
      if (search) {
        filter = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }
      }
      // sorting
      const sortOrder = sortMode === 'desc' ? -1 : 1;
      const sortOptions = {};

      const sortFields = sortBy.split(',');
      sortFields.forEach(field => {
        if (['name', 'phone'].includes(field.trim())) {
          sortOptions[field.trim()] = sortOrder;
        }
      });

      const totalUsers = await users.countDocuments(filter);
      const totalPages = Math.ceil(totalUsers / limit);
      const data = await users.find(filter).skip(skip).limit(limit).toArray();

      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({
          users: data,
          page,
          totalPages,
          limit,
          totalUsers,
          sortBy,
          sortMode,
        })
      }
      res.render('users', {
        title: "MongoDB Breads(Browse,Read,Edit,Add,Delete,Sort)",
        users: data,
        page,
        totalPages,
        limit,
        totalUsers,
        query: { search }
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })


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
