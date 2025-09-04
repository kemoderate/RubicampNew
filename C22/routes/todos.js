const express = require('express');


module.exports = (db) => {
  const router = express.Router();
  const { ObjectId, returnDocument } = require('mongodb')
  const todos = db.collection('todos');

  // RENDER PAGE TODOS
  router.get('/view/:userId', (req, res) => {
    const { userId } = req.params;
    res.render('todos', { userId, title: 'Todos List' });
  });

  // FETCH TODOS JSON (dipakai jQuery di todos.ejs)
  router.get('/user/:id', async (req, res) => {
    try {
      const { id } = req.params;
      let { page = 1, limit = 10, string = '', boolean, startdate, enddate, sortBy = '_id', sortMode = 'desc' } = req.query;
      // page
      page = parseInt(page);
      limit = parseInt(limit);

      const q = { executor: new ObjectId(id) };

      if (string) q.title = { $regex: string, $options: 'i' };
      if (boolean === 'true' || boolean === 'false') q.complete = boolean === 'true';
      if (startdate || enddate) {
        q.deadline = {};
        if (startdate) q.deadline.$gte = new Date(startdate);
        if (enddate) {
          const d = new Date(enddate);
          d.setHours(23, 59, 59, 999);
          q.deadline.$lte = d;
        }
      }
      const sortOrder = sortMode === 'asc' ? 1 : -1;
      const sortObj = {}
      sortObj[sortBy] = sortOrder;


      const total = await todos.countDocuments(q);
      const data = await todos.find(q)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const formattedData = data.map(todo => ({
        ...todo,
        deadlineFormatted: todo.deadline ? todo.deadline.toISOString().split('T')[0] : '-'
      }));

      res.json({
        data: formattedData,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        offset: (page - 1) * limit,
        sortBy,
        sortMode
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/', async (req, res) => {
    try {
      let { executor, string = '', boolean, startdate, enddate, page = 1, limit = 10 } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

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
      const total = await todos.countDocuments(q);
      const data = await todos.find(q)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray()

      res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  });

  router.post('/', async (req, res) => {
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
    // console.log("Masuk sini BODY:", req.body);
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
        { $set },
        { returnDocument: 'after' }
      );
      // console.log("UPDATE RESULT:", result);


      res.json(result)
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






