import express from 'express';
import {
  sendGoalAchievedEmail,
  sendBudgetAlertEmail,
  sendMonthlyReportEmail,
  testEmail,
  getEmailServiceStatus,
  sendCustomEmail
} from '../controllers/emailController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All email routes require authentication
router.use(authenticateToken);

// Get email service status
router.get('/status', getEmailServiceStatus);

// Send test email
router.post('/test', testEmail);

// Send goal achievement email
router.post('/goal-achieved', sendGoalAchievedEmail);

// Send budget alert email
router.post('/budget-alert', sendBudgetAlertEmail);

// Send monthly report email
router.post('/monthly-report', sendMonthlyReportEmail);

// Send custom email (admin only)
router.post('/custom', sendCustomEmail);

export default router;
