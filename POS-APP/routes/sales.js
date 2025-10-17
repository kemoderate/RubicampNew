var express = require('express');
const db = require('../db')
const upload = require('../upload');
const customers = require('./customers');



/* GET home page. */
module.exports = (requireOwner,requireLogin, db) => {

    const router = express.Router();
    


    router.get('/', requireLogin, async (req, res) => {
        try {
            const result = await db.query(`
             SELECT 
              s.invoice,
              to_char(s.time, 'YYYY-MM-DD HH24:MI:SS') as time,
              s.totalsum,
              s.customer,
              s.pay,
              s.change,
              c.name AS customername,
              u.name AS operator
              FROM sales s
              LEFT JOIN customers c ON s.customer = c.customerid
              LEFT JOIN users u ON s.operator = u.userid
              ORDER BY s.invoice DESC
`);

            const sales = result.rows;



            // render EJS dan kirim data sales
            res.render('sales', {
                title: 'sales',
                sales,
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
            const { rows } = await db.query('SELECT barcode, name, stock, sellingprice FROM goods WHERE barcode = $1', [barcode]);
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
            const result = await db.query('SELECT generate_sales_invoice() AS invoice_no');
            const invoice = result.rows[0].invoice_no;


            const check = await db.query('SELECT 1 FROM sales WHERE invoice = $1', [invoice]);
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
            req.flash('error_msg', 'Failed to add sales');
            res.redirect('/sales/add')
        }
    })


    router.get('/add', requireLogin, async (req, res) => {
        try {
            
            const invoiceResult = await db.query('SELECT generate_sales_invoice() AS invoice_no');
            const invoice = invoiceResult.rows[0].invoice_no;
            const operatorId = req.session.user.id;

            await db.query(`
            INSERT INTO sales(invoice, time, totalsum, pay, change, operator, customer)
            VALUES($1, NOW(), 0, 0, 0, $2, NULL)
        `, [invoice, operatorId]);
            const saleResult = await db.query(
                `SELECT invoice, 
                    to_char(time, 'YYYY-MM-DD HH24:MI:SS') as time, 
                    totalsum 
             FROM sales 
             WHERE invoice = $1`,
                [invoice]
            );
            saleData = saleResult.rows[0];

            const operatorResult = await db.query(
                'SELECT userid, name FROM users WHERE userid = $1',
                [operatorId]
            );

            const operator = operatorResult.rows[0];
            const goodsData = await db.query('SELECT barcode, name , stock, sellingprice FROM goods ORDER BY name ASC')
            const customersData = await db.query('SELECT customerid ,name FROM customers ORDER BY customerid ASC')

            res.render('sale-form', {
                title: 'Transaction',
                action: '/sales/add',
                entity: 'sales',
                goods: goodsData.rows,
                customers: customersData.rows,
                operator: operator,
                saleData: saleData,
                success: [],
                error: [],
                user: req.session.user,
                isEdit: false,
                items: []
            });
        } catch (err) {
            console.error('Error generating invoice:', err);
            res.render('sale-form', {
                title: 'Transaction',
                action: '/sales/add',
                entity: 'sales',
                saleData: {},
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
            const { invoice, barcode, qty, sellingprice, totalprice } = req.body;

            if (!invoice || !barcode || qty <= 0) {
                return res.status(400).json({ error: 'Invalid data' });
            }


            // Insert ke saleitems
            const result = await db.query(`
      INSERT INTO saleitems(invoice, itemcode, quantity, sellingprice, totalprice)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [invoice, barcode, qty, sellingprice, totalprice]
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
                'SELECT totalsum FROM sales WHERE invoice = $1',
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
            const { invoice, operator, customer, items } = req.body;

            await db.query(
                `UPDATE sales 
       SET customer = $1, time = $2 
       WHERE invoice = $3`,
                [customer, time, invoice]
            );

            // insert saleitems
            for (let item of JSON.parse(items)) {
                await db.query(
                    'INSERT INTO saleitems(invoice, itemcode, quantity, sellingprice, totalprice) VALUES($1, $2, $3, $4, $5)',
                    [invoice, item.barcode, item.qty, item.sellingprice, item.totalprice]
                );
            }
            const io = req.app.get('io');
            io.emit('stockUpdate');
            req.flash('success_msg', 'sales has been added !')
            res.redirect('/')
        }
        catch (err) {
            console.error(err)
            req.flash('error_msg', 'Failed to add sales');
            res.redirect('/add')
        }
    });

    router.post('/finish', requireLogin, async (req, res) => {
      
        try {
            const { invoice, customer, pay } = req.body;
            const operator = req.session.user.id;

            const {rows} = await db.query(`SELECT totalsum FROM sales WHERE invoice = $1`,[invoice]);
            const totalsum = rows[0].totalsum;
            const change = pay - totalsum;

            await db.query(
                `UPDATE sales
            SET customer = $1, operator =$2, pay = $3, change = $4
            WHERE invoice = $5`, [customer, operator, pay, change,  invoice]
            );
            req.flash('success_msg', 'sale has been completed!');
            res.redirect(`/sales`)
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'failed to finish sale');
            res.redirect(`/sales/add`);
        }
    })

    router.get('/edit/:invoice', requireLogin,requireOwner, async (req, res) => {
        const { invoice } = req.params
        const operatorResult = await db.query(
            'SELECT userid, name FROM users WHERE userid = $1',
            [req.session.user.id]
        );
        const operator = operatorResult.rows[0];
        const goodsData = await db.query('SELECT barcode, name , stock, sellingprice FROM goods ORDER BY name ASC')

        try {

            const saleResult = await db.query(`
      SELECT p.invoice, to_char(p.time, 'YYYY-MM-DD HH24:MI:SS') as time, p.totalsum, p.customer, u.name AS operator
      FROM sales p
      LEFT JOIN users u ON p.operator = u.userid
      WHERE p.invoice = $1
    `, [invoice]);

            if (saleResult.rows.length === 0) {
                req.flash('error_msg', 'Invoice not found');
                return res.redirect('/sales');
            }

            const itemsResult = await db.query(`
                SELECT pi.id,pi.itemcode, g.name ,pi.quantity, pi.sellingprice, pi.totalprice
                FROM saleitems pi
                JOIN goods g ON pi.itemcode = g.barcode
                WHERE pi.invoice = $1`, [invoice])


            const customersData = await db.query(`
      SELECT customerid, name FROM customers ORDER BY customerid ASC
    `);


            res.render('sale-form', {
                title: 'Edit sales',
                action: `/sales/edit/${invoice}`,
                entity: 'sales',
                saleData: saleResult.rows[0] || {},
                isEdit: true,
                items: itemsResult.rows,
                customers: customersData.rows,
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
            await db.query('DELETE FROM sales WHERE invoice = $1', [invoice])


            req.flash('success_msg', 'sale has been deleted!')
            res.redirect('/sales')
        } catch (err) {
            console.error(err)
            req.flash('error_msg', 'Failed to delete sales')
            res.redirect('/sales')
        }
    })

    router.get('/delete-item/:id', requireLogin, async (req, res) => {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM saleitems WHERE id = $1', [id]);
            const io = req.app.get('io');
            io.emit('stockUpdate', { action: 'delete-item', id });
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete item' });
        }
    });



    return router;
}

