const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

// Helper untuk baca/tulis file
function loadData() {
  return JSON.parse(fs.readFileSync('data.json'));
}
function saveData(data) {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// READ
app.get('/', (req, res) => {
  const data = loadData();
  res.render('index', { data });
});

// CREATE (Form)
app.get('/add', (req, res) => {
  res.render('form', { item: null, index: null });
});
app.post('/add', (req, res) => {
  const data = loadData();
  data.push(req.body);
  saveData(data);
  res.redirect('/');
});

// UPDATE (Form)
app.get('/edit/:index', (req, res) => {
  const data = loadData();
  res.render('form', { item: data[req.params.index], index: req.params.index });
});
app.post('/edit/:index', (req, res) => {
  const data = loadData();
  data[req.params.index] = req.body;
  saveData(data);
  res.redirect('/');
});

// DELETE
app.get('/delete/:index', (req, res) => {
  const data = loadData();
  data.splice(req.params.index, 1);
  saveData(data);
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
