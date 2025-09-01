import express from 'express';
import mongoose from 'mongoose';
import SavingsGoal from '../models/SavingsGoal.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkSavingsGoalProgress } from '../utils/notifications.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Get all savings goals for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    
    // Add virtual fields to response
    const goalsWithVirtuals = goals.map(goal => ({
      ...goal.toObject(),
      progressPercentage: goal.progressPercentage,
      remainingAmount: goal.remainingAmount,
      daysRemaining: goal.daysRemaining
    }));

    res.json(goalsWithVirtuals);
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
});

// Create new savings goal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      targetAmount,
      targetDate,
      category,
      priority,
      monthlyContribution,
      autoContribute,
      reminderFrequency
    } = req.body;

    // Calculate next reminder date
    let nextReminder = null;
    if (reminderFrequency !== 'never') {
      const now = new Date();
      switch (reminderFrequency) {
        case 'daily':
          nextReminder = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          nextReminder = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          nextReminder = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          break;
      }
    }

    const newGoal = new SavingsGoal({
      userId: req.user.userId,
      title,
      description,
      targetAmount,
      targetDate,
      category,
      priority,
      monthlyContribution: monthlyContribution || 0,
      autoContribute: autoContribute || false,
      reminderFrequency,
      nextReminder
    });

    const savedGoal = await newGoal.save();
    
    const goalWithVirtuals = {
      ...savedGoal.toObject(),
      progressPercentage: savedGoal.progressPercentage,
      remainingAmount: savedGoal.remainingAmount,
      daysRemaining: savedGoal.daysRemaining
    };

    res.status(201).json(goalWithVirtuals);
  } catch (error) {
    console.error('Error creating savings goal:', error);
    res.status(400).json({ error: 'Failed to create savings goal' });
  }
});

// Update savings goal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const goalId = req.params.id;
    const updates = req.body;

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: goalId, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    const goalWithVirtuals = {
      ...goal.toObject(),
      progressPercentage: goal.progressPercentage,
      remainingAmount: goal.remainingAmount,
      daysRemaining: goal.daysRemaining
    };

    res.json(goalWithVirtuals);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(400).json({ error: 'Failed to update savings goal' });
  }
});

// Add contribution to savings goal
router.post('/:id/contribute', authenticateToken, async (req, res) => {
  try {
    const goalId = req.params.id;
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid contribution amount' });
    }

    const goal = await SavingsGoal.findOne({
      _id: goalId,
      userId: req.user.userId
    });

    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    // Add contribution
    goal.contributions.push({
      amount,
      note: note || '',
      date: new Date()
    });

    // Update current amount
    goal.currentAmount += amount;

    // Check if goal is achieved
    const wasAchieved = goal.currentAmount >= goal.targetAmount && (goal.currentAmount - amount) < goal.targetAmount;

    await goal.save();

    // Send achievement email if goal is newly achieved
    if (wasAchieved) {
      try {
        const user = await User.findById(req.user.userId);
        if (user) {
          sendEmail(user.email, 'goalAchieved', {
            name: user.name,
            goalTitle: goal.title,
            amount: goal.targetAmount
          }).then(result => {
            if (result.success) {
              console.log(`✅ Goal achievement email sent to ${user.email} for goal: ${goal.title}`);
            } else {
              console.log(`⚠️ Failed to send goal achievement email: ${result.message}`);
            }
          }).catch(err => {
            console.log(`❌ Error sending goal achievement email: ${err.message}`);
          });
        }
      } catch (emailError) {
        console.error('Error sending goal achievement email:', emailError);
      }
    }

    // Check for notifications (milestones, achievements)
    await checkSavingsGoalProgress(req.user.userId, goalId);

    const goalWithVirtuals = {
      ...goal.toObject(),
      progressPercentage: goal.progressPercentage,
      remainingAmount: goal.remainingAmount,
      daysRemaining: goal.daysRemaining
    };

    res.json(goalWithVirtuals);
  } catch (error) {
    console.error('Error adding contribution:', error);
    res.status(400).json({ error: 'Failed to add contribution' });
  }
});

// Get goal statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await SavingsGoal.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalGoals: { $sum: 1 },
          completedGoals: {
            $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
          },
          activeGoals: {
            $sum: { $cond: [{ $eq: ['$isCompleted', false] }, 1, 0] }
          },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' },
          totalRemainingAmount: {
            $sum: { $subtract: ['$targetAmount', '$currentAmount'] }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalRemainingAmount: 0
    };

    // Calculate overall progress percentage
    result.overallProgress = result.totalTargetAmount > 0 
      ? Math.min((result.totalCurrentAmount / result.totalTargetAmount) * 100, 100)
      : 0;

    res.json(result);
  } catch (error) {
    console.error('Error fetching savings goals stats:', error);
    res.status(500).json({ error: 'Failed to fetch savings goals statistics' });
  }
});

// Delete savings goal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const goalId = req.params.id;

    const goal = await SavingsGoal.findOneAndDelete({
      _id: goalId,
      userId: req.user.userId
    });

    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

export default router;
