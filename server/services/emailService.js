import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: '🎉 Welcome to Smart Finance App!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Smart Finance!</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>Hi ${name}! 👋</h2>
          <p>Welcome to your personal finance journey! We're excited to help you:</p>
          <ul style="color: #333;">
            <li>📊 Track your expenses and income</li>
            <li>🎯 Set and achieve savings goals</li>
            <li>💰 Create and manage budgets</li>
            <li>📈 Get insights with AI-powered analytics</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Managing Your Finances
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
      </div>
    `
  }),

  goalAchieved: (name, goalTitle, amount) => ({
    subject: '🏆 Congratulations! Goal Achieved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Goal Achieved!</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>Congratulations ${name}! 🎊</h2>
          <p>You've successfully achieved your savings goal:</p>
          <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3 style="color: #11998e; margin: 0;">${goalTitle}</h3>
            <p style="font-size: 24px; font-weight: bold; color: #333; margin: 10px 0;">₹${amount}</p>
          </div>
          <p>This is a significant achievement! Keep up the great work and consider setting your next financial goal.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/savings-goals" 
               style="background-color: #11998e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Your Savings Goals
            </a>
          </div>
        </div>
      </div>
    `
  }),

  budgetAlert: (name, categoryName, spent, budget, percentage) => ({
    subject: '⚠️ Budget Alert - High Spending Detected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Budget Alert</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>Hi ${name},</h2>
          <p>You've spent <strong>${percentage}%</strong> of your budget for <strong>${categoryName}</strong>:</p>
          <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>Spent:</span>
              <strong style="color: #ff6b6b;">₹${spent}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>Budget:</span>
              <strong>₹${budget}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>Remaining:</span>
              <strong style="color: #11998e;">₹${budget - spent}</strong>
            </div>
          </div>
          <p>Consider reviewing your spending in this category to stay within your budget.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/budget-planner" 
               style="background-color: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Budget Details
            </a>
          </div>
        </div>
      </div>
    `
  }),

  monthlyReport: (name, data) => ({
    subject: '📊 Your Monthly Finance Report',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📊 Monthly Report</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>Hi ${name},</h2>
          <p>Here's your financial summary for this month:</p>
          <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div style="text-align: center; padding: 15px; background-color: #e8f5e8; border-radius: 8px;">
                <h3 style="color: #11998e; margin: 0;">Income</h3>
                <p style="font-size: 20px; font-weight: bold; color: #333; margin: 5px 0;">₹${data.income || 0}</p>
              </div>
              <div style="text-align: center; padding: 15px; background-color: #ffe8e8; border-radius: 8px;">
                <h3 style="color: #ff6b6b; margin: 0;">Expenses</h3>
                <p style="font-size: 20px; font-weight: bold; color: #333; margin: 5px 0;">₹${data.expenses || 0}</p>
              </div>
            </div>
            <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #f0f8ff; border-radius: 8px;">
              <h3 style="color: #667eea; margin: 0;">Net Savings</h3>
              <p style="font-size: 24px; font-weight: bold; color: #333; margin: 5px 0;">₹${(data.income || 0) - (data.expenses || 0)}</p>
            </div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Detailed Report
            </a>
          </div>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, templateName, templateData = {}) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const template = emailTemplates[templateName];
    
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = template(templateData.name || 'User', templateData);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Smart Finance App <noreply@smartfinance.com>',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return { success: true, message: 'Email service is working' };
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return { success: false, error: error.message };
  }
};

// Available email templates
export const getAvailableTemplates = () => {
  return Object.keys(emailTemplates);
};

export default {
  sendEmail,
  testEmailConnection,
  getAvailableTemplates
};
