const express = require('express');


module.exports = (db) => {
  const router = express.Router();
  const { ObjectId, returnDocument } = require('mongodb')
  const todos = db.collection('todos');

  router.get('/', async (req, res) => {
    try {
      const { executor, string = '', boolean, startdate, enddate, page = 1, limit = 10 } = req.query;
      const q = {};
      if (executor) q.executor = new ObjectId(executor);
      if (string) q.title = { $regex: string, $options: 'i' };
      if (boolean === 'true' || boolean === 'false') q.complete = boolean === 'true';
      if (startdate || enddate) {
        q.deadline = {};
        if (startdate) q.deadline.$gte = new Date(startdate);
        if (enddate) {
          const d = new Date(enddate);
          d.setHours(23, 59, 59, 999)
          q.deadline.$lte = d;
        }
      }

      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message })
    }

  });

  router.post('/', async (q, res) => {
    try {
      const { title, complete = false, deadline, executor } = req.body;
      if (!title) return res.status(400).json({ error: 'Title required' })
      const doc = {
        title,
        complete: complete === true || complete === 'true',
        deadline: deadline ? new Date(deadline) : null,
        executor: executor ? new ObjectId(executor) : null
      }

      const result = await todos.insertOne(doc);
      res.status(201).json(result)

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });



  router.get('/:id', async (req, res) => {
    try {
      const id = req.params.id
      const todo = await todos.findOne({ _id: new ObjectId(id) })
      if (!todo) return res.status(404).json({ message: ' todo not found' });
      res.json(todo)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const id = req.params.id
      const { title, complete, deadline, executor } = req.body;

      const $set = {}
      if (title !== undefined) $set.title = title;
      if (complete !== undefined) $set.complete = complete === true || complete === 'true';
      if (deadline !== undefined) $set.deadline = deadline ? new Date(deadline) : null;
      if (executor !== undefined) $set.executor = executor ? new ObjectId(executor) : null;

      const result = await todos.findOneAndUpdate({
        _id: new ObjectId(id)
      },
        { $set: { title, complete, deadline, executor } },
        { returnDocument: 'after' }
      );

      if (!result.value) return res.status(404).json({ message: 'todo not found' })
      res.json(result.value)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  router.delete('/:id', async (req, res) => {
    try {
      const id = req.params.id
      const result = await todos.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'todo not found' })
      res.json({ message: 'todo deleted' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  return router;

}






