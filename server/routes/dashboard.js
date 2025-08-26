import express from 'express';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // Default to last 30 days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get total income and expenses
    const incomeResult = await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          type: 'income',
          date: { $gte: startDate }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);

    const expenseResult = await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          type: 'expense',
          date: { $gte: startDate }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const balance = totalIncome - totalExpenses;

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        period: parseInt(period)
      },
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get spending by category
router.get('/categories', async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30', type = 'expense' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const categoryData = await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          type,
          date: { $gte: startDate }
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { total: -1 } }
    ]);

    res.json(categoryData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly trends
router.get('/trends', async (req, res) => {
  try {
    const userId = req.user._id;
    const { months = '6' } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const trends = await Transaction.aggregate([
      { 
        $match: { 
          userId,
          date: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
