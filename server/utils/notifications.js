import Notification from '../models/Notification.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';

export const createNotification = async (userId, data) => {
  try {
    const notification = new Notification({
      userId,
      ...data
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const checkBudgetAlerts = async (userId, transactionAmount, category) => {
  try {
    // Get active budgets for the user
    const budgets = await Budget.find({
      userId,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    for (const budget of budgets) {
      const categoryBudget = budget.categories.find(
        cat => cat.name.toLowerCase() === category.toLowerCase()
      );

      if (categoryBudget) {
        const usagePercentage = (categoryBudget.spentAmount / categoryBudget.budgetAmount) * 100;
        
        if (usagePercentage >= budget.alertThreshold && budget.notifications.thresholdAlert) {
          await createNotification(userId, {
            title: `Budget Alert: ${category}`,
            message: `You've spent ₹${categoryBudget.spentAmount.toFixed(2)} out of ₹${categoryBudget.budgetAmount.toFixed(2)} (${usagePercentage.toFixed(1)}%) in the ${category} category.`,
            type: 'budget-alert',
            priority: usagePercentage >= 100 ? 'high' : 'medium',
            data: {
              budgetId: budget._id,
              category,
              usagePercentage,
              spentAmount: categoryBudget.spentAmount,
              budgetAmount: categoryBudget.budgetAmount
            },
            actionUrl: '/budget-planner'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
};

export const checkSavingsGoalProgress = async (userId, goalId) => {
  try {
    const goal = await SavingsGoal.findById(goalId);
    if (!goal) return;

    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;

    // Notify on milestone achievements (25%, 50%, 75%, 100%)
    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (progressPercentage >= milestone) {
        // Check if we already notified for this milestone
        const existingNotification = await Notification.findOne({
          userId,
          type: 'achievement',
          'data.goalId': goalId,
          'data.milestone': milestone
        });

        if (!existingNotification) {
          await createNotification(userId, {
            title: milestone === 100 ? '🎉 Goal Achieved!' : `🎯 Milestone Reached!`,
            message: milestone === 100
              ? `Congratulations! You've achieved your savings goal "${goal.title}". You've saved ₹${goal.currentAmount.toFixed(2)}!`
              : `Great progress! You've reached ${milestone}% of your savings goal "${goal.title}". Keep it up!`,
            type: 'achievement',
            priority: milestone === 100 ? 'high' : 'medium',
            data: {
              goalId,
              milestone,
              currentAmount: goal.currentAmount,
              targetAmount: goal.targetAmount,
              progressPercentage
            },
            actionUrl: '/savings-goals'
          });
        }
      }
    }

    // Check if goal is approaching deadline
    const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 30 && daysRemaining > 0 && progressPercentage < 90) {
      // Check if we already sent a deadline reminder
      const existingReminder = await Notification.findOne({
        userId,
        type: 'reminder',
        'data.goalId': goalId,
        'data.type': 'deadline',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Within last week
      });

      if (!existingReminder) {
        await createNotification(userId, {
          title: '⏰ Goal Deadline Approaching',
          message: `Your savings goal "${goal.title}" is due in ${daysRemaining} days. You're at ${progressPercentage.toFixed(1)}% completion. Consider increasing your contributions!`,
          type: 'reminder',
          priority: daysRemaining <= 7 ? 'high' : 'medium',
          data: {
            goalId,
            type: 'deadline',
            daysRemaining,
            progressPercentage,
            remainingAmount: goal.targetAmount - goal.currentAmount
          },
          actionUrl: '/savings-goals'
        });
      }
    }
  } catch (error) {
    console.error('Error checking savings goal progress:', error);
  }
};

export const sendDailyBudgetReminder = async (userId) => {
  try {
    const budgets = await Budget.find({
      userId,
      isActive: true,
      'notifications.dailyReminder': true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    for (const budget of budgets) {
      const daysInPeriod = Math.ceil((budget.endDate - budget.startDate) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((new Date() - budget.startDate) / (1000 * 60 * 60 * 24));
      const remainingBudget = budget.totalBudget - budget.totalSpent;
      const daysRemaining = Math.max(daysInPeriod - daysElapsed, 1);
      const recommendedDailySpending = remainingBudget / daysRemaining;

      await createNotification(userId, {
        title: '📊 Daily Budget Update',
        message: `For your "${budget.name}" budget, you have ₹${remainingBudget.toFixed(2)} remaining. Try to spend no more than ₹${recommendedDailySpending.toFixed(2)} today to stay on track.`,
        type: 'reminder',
        priority: 'low',
        data: {
          budgetId: budget._id,
          type: 'daily-reminder',
          remainingBudget,
          recommendedDailySpending,
          daysRemaining
        },
        actionUrl: '/budget-planner'
      });
    }
  } catch (error) {
    console.error('Error sending daily budget reminder:', error);
  }
};

export const checkLargeTransaction = async (userId, amount, type) => {
  try {
    // Define large transaction thresholds (in INR)
    const thresholds = {
      expense: 10000, // ₹10,000
      income: 50000   // ₹50,000
    };

    if (amount >= thresholds[type]) {
      await createNotification(userId, {
        title: type === 'expense' ? '💸 Large Expense Recorded' : '💰 Large Income Recorded',
        message: `A ${type === 'expense' ? 'large expense' : 'significant income'} of ₹${amount.toFixed(2)} has been recorded in your account.`,
        type: 'transaction',
        priority: type === 'expense' ? 'medium' : 'low',
        data: {
          amount,
          type,
          threshold: thresholds[type]
        },
        actionUrl: '/transactions'
      });
    }
  } catch (error) {
    console.error('Error checking large transaction:', error);
  }
};
