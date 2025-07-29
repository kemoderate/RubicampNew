const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


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
    res.render('form', { formTitle: '', formAction: '/add', item: null, index: null });
});

app.post('/add', (req, res) => {
    const data = loadData();
    const newItem = {
        name: req.body.name,
        height: parseInt(req.body.height),
        weight: parseInt(req.body.weight),
        birthdate: req.body.birthdate,
        married: req.body.married === 'true'
    }
    data.push(newItem);
    saveData(data);
    res.redirect('/');
});

// UPDATE (Form)
app.get('/edit/:index', (req, res) => {
    const data = loadData();
    const index = parseInt(req.params.index) - 1;
    const person = data[index];
    res.render('form', {
        formTitle: 'Edit',
        formAction: `/edit/${index}`,
        item: person,
        index
    });
});

app.post('/edit/:index', (req, res) => {
    const data = loadData();
    const index = parseInt(req.params.index) - 1;
    data[index] = {
        name : req.body.name,
        height : parseInt (req.body.height),
        weight : parseInt (req.body.weight),
        birthdate : req.body.birthdate,
        married : req.body.married == 'true'

    };
    saveData(data);
    res.redirect('/');
});

// DELETE
app.get('/delete/:index', (req, res) => {
    const data = loadData();
    const index = parseInt(req.params.index) - 1;
   if (index >= 0 && index < data.length){
    data.splice(index, 1);
    saveData(data);
   }

    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
