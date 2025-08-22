const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const total = await User.countDocuments();
        const users = await User.find()
            .skip((page - 1) * limit)
            .limit(limit);
        res.json({ data: users, pagination: { total, page, pages: Math.ceil(total / limit) } })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});