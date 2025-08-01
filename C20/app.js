const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { countReset } = require('console');
const app = express();
const db = new sqlite3.Database('./database.db');
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    let { id, string, integer, float, startdate, enddate, boolean, page } = req.query;
    page = parseInt(page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    let filters = [];
    let params = [];

    if (id) { filters.push('id = ?'); params.push(id); }
    if (string) { filters.push('name Like ?'); params.push(`%${string}%`); }
    if (integer) { filters.push('height = ?'); params.push(integer); }
    if (float) { filters.push('weight = ?'); params.push(float); }
    if (startdate && enddate) { filters.push('birthdate BETWEEN ? AND ?'); params.push(startdate, enddate); }
    if (boolean) { filters.push('married = ?'); params.push(boolean); }

    let where = filters.length ? `WHERE ${filters.join('AND')}` : '';
    let countQuery = `SELECT COUNT (*) as count FROM data ${where}`;
    let dataQuery = `SELECT * FROM data ${where} LIMIT ? OFFSET ?`;

    db.get(countQuery, params, (err, countResult) => {
        let totalRows = countResult.count;
        let totalPages = Math.ceil(totalRows / limit);
        const url = req.url == '/' ? '/?page=1' : req.url

        db.all(dataQuery, [...params, limit, offset], (err,rows) => {
            res.render('index', {
                title : 'SQLite BREAD (Browse,Read,Edit,Add,Delete) and Pagination',
                data: rows,
                query: req.query,
                page,
                totalPages,
                url
            })
        });

    })
});

app.get('/add', (req, res) => {
    res.render('form', { formTitle: '', formAction: '/add', item: null, index: null });
});














app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));