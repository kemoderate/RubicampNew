var express = require('express');
const db = require('../db')
const router = express.Router();

function buildDateFilter(startdate, enddate, alias = '') {
  let clause = '';
  const params = [];

  if (startdate && enddate) {
    clause = `WHERE ${alias}time >= $1 AND ${alias}time < ($2::date + INTERVAL '1 day')`;
    params.push(startdate, enddate);
  } else if (startdate) {
    clause = `WHERE ${alias}time >= $1`;
    params.push(startdate);
  } else if (enddate) {
    clause = `WHERE ${alias}time < ($1::date + INTERVAL '1 day')`;
    params.push(enddate);
  }

  return { clause, params };
}

/* GET home page. */
module.exports = (requireAdmin, requireLogin, db) => {

  router.get('/', requireAdmin, requireLogin, async (req, res) => {
    try {

      const { startdate, enddate } = req.query;

      const salesFilter = buildDateFilter(startdate, enddate);
      const purchaseFilter = buildDateFilter(startdate, enddate);


      const expenseResult = await db.query(`SELECT COALESCE(SUM(totalsum),0) AS total FROM purchases ${purchaseFilter.clause}`, purchaseFilter.params);
      const expense = Number(expenseResult.rows[0].total || 0);

      const revenueResult = await db.query(`SELECT COALESCE(SUM(totalsum),0) AS total FROM sales ${salesFilter.clause}`, salesFilter.params);
      const revenue = Number(revenueResult.rows[0].total || 0);
      const earnings = revenue - expense;

      const totalSalesResult = await db.query(`SELECT COUNT(*) AS total FROM sales ${salesFilter.clause}`, salesFilter.params);
      const totalSales = Number(totalSalesResult.rows[0].total || 0);

      monthlyFilter = buildDateFilter(startdate, enddate, 's.');
const monthlyResult = await db.query(`WITH sales_monthly AS (
    SELECT DATE_TRUNC('month', time)::date AS month, SUM(totalsum) AS revenue
    FROM sales
    WHERE ($1::date IS NULL OR time >= $1)
      AND ($2::date IS NULL OR time <= ($2 + INTERVAL '1 day'))
    GROUP BY DATE_TRUNC('month', time)::date
  ),
  purchases_monthly AS (
    SELECT DATE_TRUNC('month', time)::date AS month, SUM(totalsum) AS expense
    FROM purchases
    WHERE ($1::date IS NULL OR time >= $1)
      AND ($2::date IS NULL OR time <= ($2 + INTERVAL '1 day'))
    GROUP BY DATE_TRUNC('month', time)::date
  )
  SELECT
    TO_CHAR(COALESCE(s.month, p.month), 'YYYYMM') AS yearmonth,
    COALESCE(s.month, p.month) AS month_raw,
    TO_CHAR(COALESCE(s.month, p.month), 'Mon - YY') AS month,
    COALESCE(s.revenue, 0) AS revenue,
    COALESCE(p.expense, 0) AS expense,
    (COALESCE(s.revenue, 0) - COALESCE(p.expense, 0)) AS earnings
  FROM sales_monthly s
  FULL OUTER JOIN purchases_monthly p ON s.month = p.month
  ORDER BY yearmonth ASC;
`, [startdate || null, enddate || null]);



      const monthly = monthlyResult.rows;
      


      // Calculate Direct Revenue (sales without customer - NULL values)
      let directRevenueQuery = `
          SELECT COALESCE(SUM(totalsum), 0) as direct_revenue
          FROM sales
          WHERE customer IS NULL
        `;
      const directParams = [];

      if (startdate && enddate) {
        directRevenueQuery += ` AND time BETWEEN $1 AND $2`;
        directParams.push(startdate, enddate);
      }

      const directResult = await db.query(directRevenueQuery, directParams);
      const directRevenue = Number(directResult.rows[0].direct_revenue) || 0;

      // Calculate Customer Revenue (sales with customer - NOT NULL values)
      let customerRevenueQuery = `
          SELECT COALESCE(SUM(totalsum), 0) as customer_revenue
          FROM sales
          WHERE customer IS NOT NULL
        `;
      const customerParams = [];

      if (startdate && enddate) {
        customerRevenueQuery += ` AND time BETWEEN $1 AND $2`;
        customerParams.push(startdate, enddate);
      }

      const customerResult = await db.query(customerRevenueQuery, customerParams);
      const customerRevenue = Number(customerResult.rows[0].customer_revenue) || 0;
      const totalExpense = monthly.reduce((sum, row) => sum + Number(row.expense || 0), 0);
      const totalRevenue = monthly.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
      const totalEarnings = totalRevenue - totalExpense;
      const goodsData = await db.query('SELECT barcode, name , stock, sellingprice FROM goods ORDER BY name ASC')

      res.render('dashboard', {
        title: 'Dashboard',
        user: req.session.user,
        layout: 'layout',
        revenue,
        expense,
        earnings,
        totalSales,
        totalExpense,
        totalRevenue,
        totalEarnings,
        monthly,
        directRevenue, // grafik render line chart
        customerRevenue, // grafik render pie chart
        startdate,
        enddate,
        goods: goodsData.rows
      });
    } catch (err) {
      console.error('Dashboard error :', err);
      res.status(500).send('Error loading dashboard');
    }
  });

  router.get('/export-csv', requireAdmin, requireLogin, async (req, res) => {
    try {
      const { startdate, enddate } = req.query;

      let filter = '';
      const params = [];

      if (startdate && enddate) {
        filter = `WHERE s.time >= $1 
        AND s.time < ($2::date + INTERVAL '1 day')`;
        params.push(startdate, enddate);
      }else if(startdate){
        filter = `WHERE s.time >= $1`;
        params.push(startdate);
      }else if(enddate){
        filter = `WHERE s.time < ($2::date + INTERVAL '1 day')`
        params.push(enddate);
      }

      const result = await db.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', s.time), 'YYYY-MM') AS month,
        COALESCE(SUM(s.totalsum), 0) AS revenue,
        COALESCE(SUM(p.totalsum), 0) AS expense,
        (COALESCE(SUM(s.totalsum), 0) - COALESCE(SUM(p.totalsum), 0)) AS earnings
      FROM sales s
      LEFT JOIN purchases p 
        ON DATE_TRUNC('month', s.time) = DATE_TRUNC('month', p.time)
      ${filter}
      GROUP BY DATE_TRUNC('month', s.time)
      ORDER BY month;
    `, params);

      const monthly = result.rows;

      // Generate CSV string
      let csv = 'Month,Expense,Revenue,Earnings\n';
      monthly.forEach(row => {
        csv += `${row.month},${row.expense},${row.revenue},${row.earnings}\n`;
      });

      // Set headers and send CSV
      res.header('Content-Type', 'text/csv');
      res.attachment('report.csv');
      res.send(csv);

    } catch (err) {
      console.error('Export CSV error:', err);
      res.status(500).send('Error generating CSV');
    }
  });



  return router;
}



