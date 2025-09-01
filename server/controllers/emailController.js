import { sendEmail, testEmailConnection, getAvailableTemplates } from '../services/emailService.js';
import User from '../models/User.js';

// Send welcome email to new users
export const sendWelcomeEmail = async (userId, userEmail, userName) => {
  try {
    const result = await sendEmail(userEmail, 'welcome', { name: userName });
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send goal achievement notification
export const sendGoalAchievedEmail = async (req, res) => {
  try {
    const { userId, goalTitle, amount } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await sendEmail(user.email, 'goalAchieved', {
      name: user.name,
      goalTitle,
      amount
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Goal achievement email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to send email'
      });
    }
  } catch (error) {
    console.error('Error sending goal achieved email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send budget alert email
export const sendBudgetAlertEmail = async (req, res) => {
  try {
    const { userId, categoryName, spent, budget, percentage } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await sendEmail(user.email, 'budgetAlert', {
      name: user.name,
      categoryName,
      spent,
      budget,
      percentage
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Budget alert email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to send email'
      });
    }
  } catch (error) {
    console.error('Error sending budget alert email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send monthly report email
export const sendMonthlyReportEmail = async (req, res) => {
  try {
    const { userId, reportData } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await sendEmail(user.email, 'monthlyReport', {
      name: user.name,
      ...reportData
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Monthly report email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to send email'
      });
    }
  } catch (error) {
    console.error('Error sending monthly report email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Test email service
export const testEmail = async (req, res) => {
  try {
    const { testEmail: email } = req.body;
    const user = req.user; // From auth middleware

    if (!email) {
      return res.status(400).json({ message: 'Test email address is required' });
    }

    const result = await sendEmail(email, 'welcome', { name: 'Test User' });
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get email service status
export const getEmailServiceStatus = async (req, res) => {
  try {
    const connectionTest = await testEmailConnection();
    const availableTemplates = getAvailableTemplates();

    res.status(200).json({
      success: true,
      data: {
        connectionStatus: connectionTest,
        availableTemplates,
        configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
      }
    });
  } catch (error) {
    console.error('Error getting email service status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send custom email (admin only)
export const sendCustomEmail = async (req, res) => {
  try {
    const { recipientEmail, subject, htmlContent } = req.body;
    const user = req.user;

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!recipientEmail || !subject || !htmlContent) {
      return res.status(400).json({ 
        message: 'Recipient email, subject, and content are required' 
      });
    }

    // Create a custom transporter for this email
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Smart Finance App <noreply@smartfinance.com>',
      to: recipientEmail,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: 'Custom email sent successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send custom email'
    });
  }
};
