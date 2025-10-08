var express = require('express');
const db = require('../db')
const router = express.Router();

/* GET home page. */
module.exports = (requireLogin, db) => {

  router.get('/', requireLogin, async (req, res) => {
    try {
      const { startdate, enddate } = req.query;

      let whereClause = '';
      const params = [];

      if (startdate && enddate) {
        whereClause = `WHERE date BETWEEN $1 AND $2`;
        params.push(startdate, enddate);
      }
      const expenseResult = await db.query(`SELECT COALESCE(SUM(totalsum),0) AS total FROM purchases ${whereClause}`, params);
      const expense = Number(expenseResult.rows[0].total || 0);

      const revenueResult = await db.query(`SELECT COALESCE(SUM(totalsum),0) AS total FROM sales ${whereClause}`, params);
      const revenue = Number(revenueResult.rows[0].total || 0);

      const earnings = revenue - expense;
      const totalSalesResult = await db.query(`SELECT COUNT(*) AS total FROM sales ${whereClause}`, params);
      const totalSales = Number(totalSalesResult.rows[0].total || 0);

      const monthlyResult = await db.query(`
        SELECT
        TO_CHAR(DATE_TRUNC('month', s.time), 'YYYY-MM') AS month,
        COALESCE(SUM(s.totalsum), 0) AS revenue,
        COALESCE(SUM(p.totalsum),0) AS expense,
        (COALESCE(SUM(s.totalsum), 0) - COALESCE(SUM(p.totalsum), 0)) AS earnings
        FROM sales s
        LEFT JOIN purchases p ON DATE_TRUNC('month' , s.time) =  DATE_TRUNC('month', p.time)
        ${whereClause ? whereClause : ''}
        GROUP BY DATE_TRUNC('month', s.time)
        ORDER BY month;
        `, params);

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

      res.render('dashboard', {
        title: 'Dashboard',
        user: req.session.user,
        layout: 'layout',
        revenue,
        expense,
        earnings,
        totalSales,
        monthly,
        directRevenue, // grafik render line chart
        customerRevenue, // grafik render pie chart
        startdate,
        enddate
      });
    } catch (err) {
      console.error('Dashboard error :', err);
      res.status(500).send('Error loading dashboard');
    }
  });




  return router;
}



