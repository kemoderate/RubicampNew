const express = require('express');


module.exports = (db) => {  
  const router = express.Router();
  const { ObjectId, returnDocument } = require('mongodb')
  const todos = db.collection('todos');
  const users = db.collection('users')


// render todos
router.get('/todos/:id', async (req, res) => {
  try{
    const { id } = req.params;
    
    const user = await users.findOne({ _id: new ObjectId(id) });
    if(!user){
      return res.status(404).send('User Not Found')
    }
     
    const todos = await db.collection('todos').find({userid: new ObjectId(id)}).toArray();
    res.render('todos', {title: `todo ${user.name}`,
       users: data,
      page,
      totalPages,
      query: {name, phone}
      })
  }catch(err){
    res.status(500).json({error: err.message})
  }
})



  router.get('/', async (req, res) => {
    try {
      const data = await todos.find().toArray();
      res.json(data);
    } catch (err) {
      console.log(err)
    }

  });

  router.post('/', async (q, res) => {
    try {
      const { title, complete, deadline, executor } = req.body;
      if(!title) return res.status(400).json({error: 'Title required'})
      const result = await todos.insertOne({
        title, complete, deadline, executor
      });
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
  try{
    const id = req.params.id
    const result = await todos.deleteOne({_id: new ObjectId(id)});
    if (result.deletedCount === 0) return res.status(404).json ({message: 'todo not found'})
      res.json({message: 'todo deleted'})
  }   catch(err){
    res.status(500).json({error: err.message})
  }
  })

  return router;

}






