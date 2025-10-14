var express = require('express');
const db = require('../db')
const upload = require('../upload')



/* GET home page. */
module.exports = (requireAdmin,requireLogin, db) => {

    const router = express.Router();

    router.get('/', requireAdmin,requireLogin, async (req, res) => {
        try {
            const result = await db.query(`SELECT 
        g.barcode,
        g.name, 
        g.stock, 
        g.purchaseprice, 
        g.sellingprice, 
        g.unit, 
        g.picture 
        FROM goods g 
        JOIN units u ON g.unit = u.unit
        ORDER BY g.unit ASC
        `);

            const goods = result.rows;



            // render EJS dan kirim data goods
            res.render('goods', {
                title: 'Goods',
                goods,
                user: req.session.user,
                layout: 'layout',
            });
        } catch (err) {
            console.error(err);
            res.send('Error ' + err);
        }
    });

    router.get('/add', requireAdmin,requireLogin, async (req, res) => {

        const units = await db.query('SELECT unit, name FROM units ORDER BY name ASC');
        res.render('good-form', {
            title: 'Add Goods',
            action: '/goods/add',
            goodData: {},
            units: units.rows,
            user: req.session.user
        })
    })
    router.post('/add', upload.single('picture'), requireAdmin,requireLogin, async (req, res) => {
        try {
            const { name, stock, purchaseprice, sellingprice, unit } = req.body
            const picture = req.file ? req.file.filename : null;

            if (!name) {
                req.flash('error_msg', 'Goods field must be filled!')
                return res.redirect('/goods/add');
            }
            const barcode = Date.now().toString().slice(-12);

            await db.query(
                `INSERT INTO goods (barcode,name, stock, purchaseprice, sellingprice, unit, picture) 
                VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [barcode, name, stock, purchaseprice, sellingprice, unit, picture]
            );
            req.flash('success_msg', 'goods has been added !')
            res.redirect('/goods')
        }
        catch (err) {
            console.error(err)
            req.flash('error_msg', 'Failed to add goods');
            res.redirect('/goods/add')
        }
    });

    router.get('/edit/:barcode', requireAdmin,requireLogin, async (req, res) => {
        const { barcode } = req.params
        const units = await db.query('SELECT unit, name FROM units ORDER BY name ASC');
        try {
            const { rows } = await db.query('SELECT * FROM goods WHERE barcode = $1', [barcode]);
            if (rows.length === 0) {
                req.flash('error_msg', 'Goods not found')
                return res.redirect('/goods')
            }

            res.render('good-form', {
                title: 'Edit goods',
                action: `/goods/edit/${barcode}`,
                goodData: rows[0],
                user: req.session.user,
                units: units.rows,
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Error Showing Edit Form')
        }
    });

    router.post('/edit/:barcode',upload.single('picture'), requireAdmin,requireLogin, async (req, res) => {
        const { barcode } = req.params
        const { name, stock, purchaseprice, sellingprice, unit, oldPicture } = req.body
        const picture = req.file ? req.file.filename : oldPicture;

        if (!name ) {
            req.flash('error_msg', 'Semua field wajib diisi');
            return res.redirect(`/goods/edit/${barcode}`)
        }

        try {
            await db.query('UPDATE goods SET name = $1,stock = $2,purchaseprice = $3,sellingprice = $4,unit = $5, picture = $6 WHERE barcode = $7',
                [name, stock, purchaseprice, sellingprice, unit, picture, barcode]
            )
            req.flash('success_msg', 'Goods has been updated!')
            res.redirect('/goods')
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'failed updating Goods')
            res.redirect(`/goods/edit/${barcode}`);
        }
    })

    router.get('/delete/:barcode', requireAdmin,requireLogin, async (req, res) => {
        const { barcode } = req.params
        try {
            await db.query('DELETE FROM goods WHERE barcode = $1', [barcode])
            req.flash('success_msg', 'Goods has been deleted!')
            res.redirect('/goods')
        } catch (err) {
            console.error(err)
            req.flash('error_msg', 'Failed to delete Goods')
            res.redirect('/goods')
        }
    })


    return router;
}

