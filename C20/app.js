const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { countReset } = require('console');
const app = express();
const db = new sqlite3.Database('./database.db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set(express.static(path.join(__dirname, 'public')));
app.set(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    let { id, string, integer, float, startdate, enddate, boolean, page } = req.query;
    page = parseInt(page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    let filters = [];
    let params = [];

    if (id) { filters.push('id = ?'); params.push(id); }
    if (string) { filters.push('string Like ?'); params.push(`%${string}%`); }
    if (integer) { filters.push('integer = ?'); params.push(integer); }
    if (float) { filters.push('float = ?'); params.push(float); }
    if (startdate && enddate) { filters.push('date BETWEEN ? AND ?'); params.push(startdate, enddate); }
    if (boolean) { filters.push('boolean = ?'); params.push(boolean); }

    let where = filters.length ? `WHERE ${filters('AND')}` : '';
    let countQuery = `SELECT COUNT (*) as count FROM bread ${where}`;
    let dataQuery = `SELECT * FROM bread ${where} LIMIT ? OFFSET ?`;

    db.get(countQuery, params, (err, countResult) => {
        let totalRows = countResult.count;
        let totalPages = Math.ceil(totalRows / limit);

        db.all(dataQuery, [...params, limit, offset], (err,rows) => {
            res.render('index', {
                data: rows,
                query: req.query,
                page,
                totalPages
            })
        });

    })
});

