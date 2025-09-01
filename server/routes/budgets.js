import express from 'express';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Get all budgets for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    
    // Add virtual fields to response
    const budgetsWithVirtuals = budgets.map(budget => ({
      ...budget.toObject(),
      usagePercentage: budget.usagePercentage,
      remainingBudget: budget.remainingBudget
    }));

    res.json(budgetsWithVirtuals);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create new budget
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      period,
      startDate,
      endDate,
      categories,
      alertThreshold,
      notifications
    } = req.body;

    // Calculate total budget from categories
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetAmount, 0);

    const newBudget = new Budget({
      userId: req.user.userId,
      name,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categories,
      totalBudget,
      alertThreshold: alertThreshold || 80,
      notifications: notifications || {
        enabled: true,
        thresholdAlert: true,
        dailyReminder: false
      }
    });

    const savedBudget = await newBudget.save();
    
    const budgetWithVirtuals = {
      ...savedBudget.toObject(),
      usagePercentage: savedBudget.usagePercentage,
      remainingBudget: savedBudget.remainingBudget
    };

    res.status(201).json(budgetWithVirtuals);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(400).json({ error: 'Failed to create budget' });
  }
});

// Update budget spending based on transactions
router.put('/:id/sync-spending', authenticateToken, async (req, res) => {
  try {
    const budgetId = req.params.id;

    const budget = await Budget.findOne({
      _id: budgetId,
      userId: req.user.userId
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Get transactions for the budget period
    const transactions = await Transaction.find({
      userId: req.user.userId,
      type: 'expense',
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate
      }
    });

    // Reset spent amounts
    budget.categories.forEach(category => {
      category.spentAmount = 0;
    });

    // Calculate spent amounts by category
    transactions.forEach(transaction => {
      const category = budget.categories.find(cat => 
        cat.name.toLowerCase() === transaction.category.toLowerCase()
      );
      
      if (category) {
        category.spentAmount += transaction.amount;
      } else {
        // Add to "Other" category if specific category not found
        const otherCategory = budget.categories.find(cat => cat.name === 'Other');
        if (otherCategory) {
          otherCategory.spentAmount += transaction.amount;
        }
      }
    });

    // Update total spent
    budget.totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0);

    await budget.save();

    const budgetWithVirtuals = {
      ...budget.toObject(),
      usagePercentage: budget.usagePercentage,
      remainingBudget: budget.remainingBudget
    };

    res.json(budgetWithVirtuals);
  } catch (error) {
    console.error('Error syncing budget spending:', error);
    res.status(500).json({ error: 'Failed to sync budget spending' });
  }
});

// Get budget analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const budgetId = req.params.id;

    const budget = await Budget.findOne({
      _id: budgetId,
      userId: req.user.userId
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Get daily spending trend
    const dailySpending = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.userId,
          type: 'expense',
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          dailyTotal: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Category analysis
    const categoryAnalysis = budget.categories.map(category => ({
      name: category.name,
      budgetAmount: category.budgetAmount,
      spentAmount: category.spentAmount,
      remainingAmount: Math.max(category.budgetAmount - category.spentAmount, 0),
      usagePercentage: category.budgetAmount > 0 
        ? Math.min((category.spentAmount / category.budgetAmount) * 100, 100) 
        : 0,
      isOverBudget: category.spentAmount > category.budgetAmount,
      overBudgetAmount: Math.max(category.spentAmount - category.budgetAmount, 0)
    }));

    // Budget health metrics
    const daysInPeriod = Math.ceil((budget.endDate - budget.startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((new Date() - budget.startDate) / (1000 * 60 * 60 * 24));
    const expectedSpending = (budget.totalBudget / daysInPeriod) * Math.min(daysElapsed, daysInPeriod);
    const spendingRate = daysElapsed > 0 ? budget.totalSpent / daysElapsed : 0;
    const projectedSpending = spendingRate * daysInPeriod;

    const analytics = {
      budget: {
        ...budget.toObject(),
        usagePercentage: budget.usagePercentage,
        remainingBudget: budget.remainingBudget
      },
      dailySpending,
      categoryAnalysis,
      healthMetrics: {
        daysInPeriod,
        daysElapsed,
        daysRemaining: Math.max(daysInPeriod - daysElapsed, 0),
        expectedSpending,
        actualSpending: budget.totalSpent,
        spendingVariance: budget.totalSpent - expectedSpending,
        dailySpendingRate: spendingRate,
        projectedSpending,
        isOnTrack: projectedSpending <= budget.totalBudget,
        recommendedDailySpending: budget.remainingBudget / Math.max(daysInPeriod - daysElapsed, 1)
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching budget analytics:', error);
    res.status(500).json({ error: 'Failed to fetch budget analytics' });
  }
});

// Update budget
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const budgetId = req.params.id;
    const updates = req.body;

    // Recalculate total budget if categories were updated
    if (updates.categories) {
      updates.totalBudget = updates.categories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: budgetId, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const budgetWithVirtuals = {
      ...budget.toObject(),
      usagePercentage: budget.usagePercentage,
      remainingBudget: budget.remainingBudget
    };

    res.json(budgetWithVirtuals);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(400).json({ error: 'Failed to update budget' });
  }
});

// Delete budget
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const budgetId = req.params.id;

    const budget = await Budget.findOneAndDelete({
      _id: budgetId,
      userId: req.user.userId
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export default router;
