const express = require('express');


module.exports = (db) => {
  const router = express.Router();
  const todos = db.collection('todos');
  router.get('/', async (req, res) => {
    try {
      const data = await todos.find().toArray();
      res.json(data);
    } catch (err) {
      console.log(err)
    }

  });
  // POST new bread
  router.post('/', async (req, res) => {
    try {
      const { title, complete, deadline, executor } = req.body;
      const result = await todos.insertOne({
        title, complete, deadline, executor
      });
      res.status(201).json(result)

    } catch (err) {
      res.status(500).json({error: err.message});
    }
  });

  // router.get('/:id', (req, res) => {
  //   const bread = breads.find(b => b.id === parseInt(req.params.id));
  //   if (!bread) return res.status(404).json({ message: 'Bread not found' });
  //   res.json(bread);
  // });



  // // PUT update bread
  // router.put('/:id', (req, res) => {
  //   const bread = breads.find(b => b.id === parseInt(req.params.id));
  //   if (!bread) return res.status(404).json({ message: 'Bread not found' });

  //   const { name, price } = req.body;
  //   if (name) bread.name = name;
  //   if (price) bread.price = price;

  //   res.json(bread);
  // });

  // // DELETE bread
  // router.delete('/:id', (req, res) => {
  //   const index = breads.findIndex(b => b.id === parseInt(req.params.id));
  //   if (index === -1) return res.status(404).json({ message: 'Bread not found' });

  //   const deleted = breads.splice(index, 1);
  //   res.json(deleted[0]);
  // });




  return router;

}






