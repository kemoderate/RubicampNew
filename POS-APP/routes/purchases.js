var express = require('express');
const db = require('../db')
const upload = require('../upload');
const suppliers = require('./suppliers');



/* GET home page. */
module.exports = (requireOwner,requireLogin, db, io) => {

    const router = express.Router();

    router.get('/', requireLogin, async (req, res) => {
        try {
            const result = await db.query(`
             SELECT 
              p.invoice,
              to_char(p.time, 'YYYY-MM-DD HH24:MI:SS') as time,
              p.totalsum,
              p.supplier,
              s.name AS suppliername,
              u.name AS operator
              FROM purchases p
              LEFT JOIN suppliers s ON p.supplier = s.supplierid
              LEFT JOIN users u ON p.operator = u.userid
              ORDER BY p.invoice DESC
`);

            const purchases = result.rows;



            // render EJS dan kirim data purchases
            res.render('purchases', {
                title: 'Purchases',
                purchases,
                user: req.session.user,
                layout: 'layout',
            });
        } catch (err) {
            console.error(err);
            res.send('Error ' + err);
        }
    });

    router.get('/goods/:barcode', requireLogin, async (req, res) => {
        try {
            const { barcode } = req.params;
            const { rows } = await db.query('SELECT barcode, name, stock, purchaseprice FROM goods WHERE barcode = $1', [barcode]);
            if (rows.length === 0) return res.status(404).json({ error: 'Goods not found' });
            res.json(rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'server error' })

        }
    })

    router.get('/generate-invoice', requireLogin, async (req, res) => {
        try {
            const operatorId = req.session.user.id;
            const result = await db.query('SELECT generate_invoice_no() AS invoice_no');
            const invoice = result.rows[0].invoice_no;


            const check = await db.query('SELECT 1 FROM purchases WHERE invoice = $1', [invoice]);
            if (check.rows.length > 0) {
                return res.json({ invoice, message: 'Invoice already exists' });
            }

            res.json({
                invoice: insert.rows[0].invoice,
                time: insert.rows[0].time,        // Server time in ISO format
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
            const time = new Date().toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS
            const invoiceResult = await db.query('SELECT generate_invoice_no() AS invoice_no');
            const invoice = invoiceResult.rows[0].invoice_no;
            const operatorId = req.session.user.id;

            await db.query(`
            INSERT INTO purchases(invoice, time, totalsum, operator,supplier)
            VALUES($1, NOW(), 0, $2, NULL)
        `, [invoice, operatorId]);
            const purchaseResult = await db.query(
                `SELECT invoice, 
                    to_char(time, 'YYYY-MM-DD HH24:MI:SS') as time, 
                    totalsum 
             FROM purchases 
             WHERE invoice = $1`,
                [invoice]
            );
            purchaseData = purchaseResult.rows[0];

            const operatorResult = await db.query(
                'SELECT userid, name FROM users WHERE userid = $1',
                [operatorId]
            );

            const operator = operatorResult.rows[0];
            const goodsData = await db.query('SELECT barcode, name , stock, purchaseprice FROM goods ORDER BY name ASC')
            const suppliersData = await db.query('SELECT supplierid ,name FROM suppliers ORDER BY supplierid ASC')
            

            res.render('purchase-form', {
                title: 'Transaction',
                action: '/purchases/add',
                entity: 'purchases',
                goods: goodsData.rows,
                suppliers: suppliersData.rows,
                operator: operator,
                purchaseData: purchaseData,
                success: [],
                error: [],
                user: req.session.user,
                isEdit: false,
                items: []
            });
        } catch (err) {
            console.error('Error generating invoice:', err);
            res.render('purchase-form', {
                title: 'Transaction',
                action: '/purchases/add',
                entity: 'purchases',
                purchaseData: {},
                success: [],
                error: ['failed to generate invoice number'],
                user: req.session.user,
                isEdit: false
            });
        }
    })
    // Tambah item langsung ke database
    router.post('/add-item', requireLogin, async (req, res) => {
        try {
            const { invoice, barcode, qty, purchaseprice, totalprice } = req.body;

            if (!invoice || !barcode || qty <= 0) {
                return res.status(400).json({ error: 'Invalid data' });
            }


            // Insert ke purchaseitems
            const result = await db.query(`
      INSERT INTO purchaseitems(invoice, itemcode, quantity, purchaseprice, totalprice)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [invoice, barcode, qty, purchaseprice, totalprice]
            );

            res.json({ success: true, id: result.rows[0].id });
        } catch (err) {
            console.error('Error adding item:', err);
            res.status(500).json({ error: 'Server error while adding item' });
        }
    });

    router.get('/totalsum/:invoice', requireLogin, async (req, res) => {
        try {
            const { invoice } = req.params;
            const result = await db.query(
                'SELECT totalsum FROM purchases WHERE invoice = $1',
                [invoice]
            );
            res.json({ totalsum: result.rows[0].totalsum });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get totalsum' });
        }
    });
    
    router.post(`/add`, requireLogin, async (req, res) => {
        try {
            const { invoice, operator, supplier, items } = req.body;

            await db.query(
                `UPDATE purchases 
       SET supplier = $1, time = $2 
       WHERE invoice = $3`,
                [supplier, time, invoice]
            );

            // insert purchaseitems
            for (let item of JSON.parse(items)) {
                await db.query(
                    'INSERT INTO purchaseitems(invoice, itemcode, quantity, purchaseprice, totalprice) VALUES($1, $2, $3, $4, $5)',
                    [invoice, item.barcode, item.qty, item.purchaseprice, item.totalprice]
                );
            }
            const io = req.app.get('io');
            io.emit('stockUpdate');
            req.flash('success_msg', 'purchases has been added !')
            res.redirect('/')
        }
        catch (err) {
            console.error(err)
            req.flash('error_msg', 'Failed to add purchases');
            res.redirect('/add')
        }
    });

    router.post('/finish', requireLogin, async (req, res) => {
        console.log('Finish Payload:', req.body);
        try {
            const { invoice, supplier, } = req.body;
            const operator = req.session.user.id;

            await db.query(
                `UPDATE purchases
            SET supplier = $1, operator =$2
            WHERE invoice = $3`, [supplier, operator, invoice]
            );
            req.flash('success_msg', 'Purchase has been completed!');
            res.redirect(`/purchases`)
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'failed to finish purchase');
            res.redirect(`/purchases/add`);
        }
    })

    router.get('/edit/:invoice',requireLogin,requireOwner, async (req, res) => {
        const { invoice } = req.params
        const operatorResult = await db.query(
            'SELECT userid, name FROM users WHERE userid = $1',
            [req.session.user.id]
        );
        const operator = operatorResult.rows[0];
        const goodsData = await db.query('SELECT barcode, name , stock, purchaseprice FROM goods ORDER BY name ASC')

        try {

            const purchaseResult = await db.query(`
      SELECT p.invoice, to_char(p.time, 'YYYY-MM-DD HH24:MI:SS') as time, p.totalsum, p.supplier, u.name AS operator
      FROM purchases p
      LEFT JOIN users u ON p.operator = u.userid
      WHERE p.invoice = $1
    `, [invoice]);

            if (purchaseResult.rows.length === 0) {
                req.flash('error_msg', 'Invoice not found');
                return res.redirect('/purchases');
            }

            const itemsResult = await db.query(`
                SELECT pi.id,pi.itemcode, g.name ,pi.quantity, pi.purchaseprice, pi.totalprice
                FROM purchaseitems pi
                JOIN goods g ON pi.itemcode = g.barcode
                WHERE pi.invoice = $1`, [invoice])


            const suppliersData = await db.query(`
      SELECT supplierid, name FROM suppliers ORDER BY supplierid ASC
    `);


            res.render('purchase-form', {
                title: 'Edit purchases',
                action: `/purchases/edit/${invoice}`,
                entity: 'purchases',
                purchaseData: purchaseResult.rows[0] || {},
                isEdit: true,
                items: itemsResult.rows,
                suppliers: suppliersData.rows,
                user: req.session.user,
                goods: goodsData.rows,
                operator: operator
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Error Showing Edit Form')
        }
    });

    router.get('/delete/:invoice', requireLogin,requireOwner, async (req, res) => {
        const { invoice } = req.params
        try {
            await db.query('DELETE FROM purchases WHERE invoice = $1', [invoice])
            const io = req.app.get('io');
              io.emit('stockUpdate', { invoice, action: 'delete' });
            req.flash('success_msg', 'Purchase has been deleted!')
            res.redirect('/purchases')
        } catch (err) {
            console.error(err)
            req.flash('error_msg', 'Failed to delete Purchases')
            res.redirect('/purchases')
        }
    })

    router.get('/delete-item/:id', requireLogin, async (req, res) => {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM purchaseitems WHERE id = $1', [id]);
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete item' });
        }
    });



    return router;
}

