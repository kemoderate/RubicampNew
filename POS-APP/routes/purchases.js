var express = require('express');
const db = require('../db')
const upload = require('../upload')



/* GET home page. */
module.exports = (requireLogin, db) => {

    const router = express.Router();

    router.get('/', requireLogin, async (req, res) => {
        try {
            const result = await db.query(`
             SELECT 
              p.invoice,
              p.time,
              p.totalsum,
              p.supplier,
              u.name AS operator
              FROM purchases p
              LEFT JOIN users u ON p.operator = u.userid
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

    router.get('/goods/:barcode', requireLogin , async (req,res)=>{
        try{
            const {barcode} = req.params;
            const {rows} = await db.query('SELECT barcode, name, stock, purchaseprice FROM goods WHERE barcode = $1',[barcode]);
            if (rows.length === 0) return res.status(404).json({error: 'Goods not found'});
            res.json(rows[0]);
        }
        catch(err){
            console.err(err);
            res.status(500).json({error:'server error'})

        }
    })

    router.get('/generate-invoice', async (req, res) => {
        try {
            const result = await db.query('SELECT generate_invoice_no() AS invoice_no');
            res.json({
                invoice: result.rows[0].invoice_no,
                time: new Date().toISOString(),        // Server time in ISO format
                operator: req.session.user.name,

            });
        } catch (err) {
            console.error(err)
            req.flash('error_msg', 'Failed to add purchases');
            res.redirect('/purchases/add')
        }
    })

    router.get('/add', requireLogin, async (req, res) => {
        try {
            const operatorResult = await db.query(
                'SELECT userid, name FROM users WHERE userid = $1',
                [req.session.user.id]
            );
            const operator = operatorResult.rows[0];

            const goodsData = await db.query('SELECT barcode, name , stock, purchaseprice FROM goods ORDER BY name ASC')

            const suppliersData = await db.query('SELECT name FROM suppliers ORDER BY supplierid ASC')
            res.render('purchase-form', {
                title: 'Transaction',
                action: '/purchases/add',
                goods: goodsData.rows,
                suppliers: suppliersData.rows,
                operator: operator,
                purchaseData: {

                },
                success: [],
                error: [],
                user: req.session.user
            });
        } catch (err) {
            console.error('Error generating invoice:', err);
            res.render('purchase-form', {
                title: 'Transaction',
                action: '/purchases/add',
                purchaseData: {},
                success: [],
                error: ['failed to generate invoice number'],
                user: req.session.user
            });
        }
    })
    router.post('/add', requireLogin, async (req, res) => {
        try {
            const {invoice , operator , supplier, items } = req.body;
            const time = new Date();

            if (!invoice) {
                req.flash('error_msg', 'invoice field must be filled!')
                return res.redirect('/purchases/add');
            }
            const barcode = Date.now().toString().slice(-12);

            // insert purchases
            await db.query('INSERT INTO purchases(invoice, time, supplier, operator) VALUES($1,$2,$3,$4)',[invoice, time, supplier, operator]

            );

            // insert purchaseitems
            for(let item of JSON.parse(items)) {
                await db.query(
                    'INSERT INTO purchaseitems(invoice, itemcode, quantity, purchaseprice, totalprice) VALUES($1,$2,$3,$4,$5)',
                    [invoice, item.barcode, item.qty, item.purchaseprice, item.totalprice]
                );
            }
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

    router.post('/edit/:barcode', upload.single('picture'), requireLogin, async (req, res) => {
        const { barcode } = req.params
        const { name, stock, purchaseprice, sellingprice, unit, oldPicture } = req.body
        const picture = req.file ? req.file.filename : oldPicture;

        if (!name) {
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

