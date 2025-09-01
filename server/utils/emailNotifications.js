import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

// Check if budget alert should be sent (80% threshold)
export const checkBudgetAlert = async (userId, categoryName, spentAmount, budgetAmount) => {
  try {
    const percentage = (spentAmount / budgetAmount) * 100;
    
    // Send alert at 80% and 100% spending
    if (percentage >= 80) {
      const user = await User.findById(userId);
      if (user) {
        sendEmail(user.email, 'budgetAlert', {
          name: user.name,
          categoryName,
          spent: spentAmount,
          budget: budgetAmount,
          percentage: Math.round(percentage)
        }).then(result => {
          if (result.success) {
            console.log(`✅ Budget alert email sent to ${user.email} for ${categoryName} (${percentage.toFixed(1)}%)`);
          } else {
            console.log(`⚠️ Failed to send budget alert email: ${result.message}`);
          }
        }).catch(err => {
          console.log(`❌ Error sending budget alert email: ${err.message}`);
        });
      }
    }
  } catch (error) {
    console.error('Error checking budget alert:', error);
  }
};

// Send monthly report email
export const sendMonthlyReport = async (userId, reportData) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      const result = await sendEmail(user.email, 'monthlyReport', {
        name: user.name,
        income: reportData.income,
        expenses: reportData.expenses
      });
      
      if (result.success) {
        console.log(`✅ Monthly report sent to ${user.email}`);
        return { success: true, messageId: result.messageId };
      } else {
        console.log(`⚠️ Failed to send monthly report: ${result.message}`);
        return { success: false, message: result.message };
      }
    }
  } catch (error) {
    console.error('Error sending monthly report:', error);
    return { success: false, message: error.message };
  }
};
