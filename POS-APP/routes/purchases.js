var express = require('express');
const db = require('../db')
const upload = require('../upload')



/* GET home page. */
module.exports = (requireLogin, db) => {

    const router = express.Router();

    router.get('/', requireLogin, async (req, res) => {
        try {
            const result = await db.query(`SELECT 
        p.invoice,
        p.time, 
        p.totalsum, 
        p.supplier, 
        p.operator 
        FROM purchases p
       
        ORDER BY p.invoice ASC
        `);

            const purchases = result.rows;



            // render EJS dan kirim data purchases
            res.render('purchases', {
                title: 'Goods',
                purchases,
                user: req.session.user,
                layout: 'layout',
            });
        } catch (err) {
            console.error(err);
            res.send('Error ' + err);
        }
    });

    router.get('/add', requireLogin, async (req, res) => {

        const units = await db.query('SELECT unit, name FROM units ORDER BY name ASC');
        res.render('purchase-form', {
            title: 'Add Goods',
            action: '/purchases/add',
            purchaseData: {},
            units: units.rows,
            user: req.session.user
        })
    })
    router.post('/add', upload.single('picture'), requireLogin, async (req, res) => {
        try {
            const { name, stock, purchaseprice, sellingprice, unit } = req.body
            const picture = req.file ? req.file.filename : null;

            if (!name) {
                req.flash('error_msg', 'Goods field must be filled!')
                return res.redirect('/purchases/add');
            }
            const barcode = Date.now().toString().slice(-12);

            await db.query(
                `INSERT INTO purchases (barcode,name, stock, purchaseprice, sellingprice, unit, picture) 
                VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [barcode, name, stock, purchaseprice, sellingprice, unit, picture]
            );
            req.flash('success_msg', 'purchases has been added !')
            res.redirect('/purchases')
        }
        catch (err) {
            console.error(err)
            req.flash('error_msg', 'Failed to add purchases');
            res.redirect('/purchases/add')
        }
    });

    router.get('/edit/:barcode', requireLogin, async (req, res) => {
        const { barcode } = req.params
        const units = await db.query('SELECT unit, name FROM units ORDER BY name ASC');
        try {
            const { rows } = await db.query('SELECT * FROM purchases WHERE barcode = $1', [barcode]);
            if (rows.length === 0) {
                req.flash('error_msg', 'Goods not found')
                return res.redirect('/purchases')
            }

            res.render('purchase-form', {
                title: 'Edit purchases',
                action: `/purchases/edit/${barcode}`,
                purchaseData: rows[0],
                user: req.session.user,
                units: units.rows,
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Error Showing Edit Form')
        }
    });

    router.post('/edit/:barcode',upload.single('picture'), requireLogin, async (req, res) => {
        const { barcode } = req.params
        const { name, stock, purchaseprice, sellingprice, unit, oldPicture } = req.body
        const picture = req.file ? req.file.filename : oldPicture;

        if (!name ) {
            req.flash('error_msg', 'Semua field wajib diisi');
            return res.redirect(`/purchases/edit/${barcode}`)
        }

        try {
            await db.query('UPDATE purchases SET name = $1,stock = $2,purchaseprice = $3,sellingprice = $4,unit = $5, picture = $6 WHERE barcode = $7',
                [name, stock, purchaseprice, sellingprice, unit, picture, barcode]
            )
            req.flash('success_msg', 'Goods has been updated!')
            res.redirect('/purchases')
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'failed updating Goods')
            res.redirect(`/purchases/edit/${barcode}`);
        }
    })

    router.get('/delete/:barcode', requireLogin, async (req, res) => {
        const { barcode } = req.params
        try {
            await db.query('DELETE FROM purchases WHERE barcode = $1', [barcode])
            req.flash('success_msg', 'Goods has been deleted!')
            res.redirect('/purchases')
        } catch (err) {
            console.error(err)
            req.flash('error_msg', 'Failed to delete Goods')
            res.redirect('/purchases')
        }
    })


    return router;
}

