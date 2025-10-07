var express = require('express');
const db = require('../db')
const router = express.Router();

/* GET home page. */
module.exports = (requireLogin, db) => {

  router.get('/', requireLogin, async (req, res) => {
    try{
      const {startdate, enddate} = req.query;

      let whereClause = '';
      const params = [];

      if(startdate && enddate) {
        whereClause = `WHERE date BETWEEN $1 AND $2`;
        params.push(startdate, enddate);
      }
      const expenseResult = await db.query(`SELECT COALESCE(SUM(totalsum),0) AS total FROM purchases ${whereClause}`, params);
      const expense = expenseResult.total;

      const revenueResult = await db.query (`SELECT COALESCE(SUM(totalsum),0) AS total FROM sales ${whereClause}`, params); 
      const revenue = revenueResult.total
      
      const earnings = revenue - expense;
      const totalSalesResult = await db.query(`SELECT COUNT(*) AS total FROM sales ${whereClause}`, params);
      const totalSales = totalSalesResult.total;

      const monthly = await db.query(`
        SELECT
        TO_CHAR(DATE_TRUNC('month', s.time), 'YYYY-MM') AS month,
        COALESCE(SUM(s.totalsum), 0) AS revenue,
        COALESCE(SUM(p.totalsum)),0 AS expense,
        COALESCE(SUM(s.totalsum), 0) - COALESCE(SUM(p.totalsum), 0)) AS earnings
        FROM sales s
        LEFT JOIN purchases p ON DATE TRUNC('month' . s.time) =  DATE_TRUNC('month', p.time)
        ${whereClause ? whereClause : ''}
        GROUP BY DATE_TRUNC('month', s,time)
        ORDER BY month;
        ,params`);
    
        res.render('dashboard', {
      title: 'Dashboard',
      user: req.session.user,
      layout: 'layout',
      revenue,
      expense,
      earnings,
      totalSales,
      monthly,
      startdate,
      enddate
    });
    } catch (err){
      console.error('Dashboard error :', err);
      res.status(500).send('Error loading dashboard');
    }
  });

  

  return router;
}



