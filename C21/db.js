const {pool} = require('pg');

const pool = new pool ({
    user: 'postgres',
    host: 'localhost',
    database: 'breadsdb',
    password: 'password',
    port: 5342,
})

module.exports = pool;