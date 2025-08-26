import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Handle chatbot queries
router.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Get user's financial data for context
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(20);

    // Calculate basic stats
    const totalIncome = await Transaction.aggregate([
      { $match: { userId, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Transaction.aggregate([
      { $match: { userId, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const categorySpending = await Transaction.aggregate([
      { $match: { userId, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    // Create context for AI
    const financialContext = {
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      balance: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      topCategories: categorySpending.slice(0, 5),
      recentTransactions: recentTransactions.slice(0, 5).map(t => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date.toDateString()
      }))
    };

    // Prepare prompt for Gemini
    const systemPrompt = `You are a helpful financial advisor chatbot. The user is asking about their personal finances. 

User's Financial Summary:
- Total Income: ₹${financialContext.totalIncome}
- Total Expenses: ₹${financialContext.totalExpenses}
- Current Balance: ₹${financialContext.balance}
- Top Spending Categories: ${financialContext.topCategories.map(c => `${c._id}: ₹${c.total}`).join(', ')}

Recent Transactions:
${financialContext.recentTransactions.map(t => `${t.date}: ${t.type} of ₹${t.amount} in ${t.category}`).join('\n')}

Provide helpful, personalized financial advice based on this data. Keep responses concise and actionable. Use emojis where appropriate. All amounts are in Indian Rupees (INR).

User's question: ${message}`;

    let aiResponse;
    let suggestions = [];

    // Try Gemini AI first
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        aiResponse = response.text();
        
        // Generate relevant suggestions based on the context
        suggestions = generateSuggestions(message, financialContext);
        
      } catch (geminiError) {
        console.error('Gemini AI error:', geminiError);
        aiResponse = generateMockResponse(message, financialContext);
      }
    } else {
      aiResponse = generateMockResponse(message, financialContext);
    }

    res.json({ 
      response: aiResponse,
      suggestions: suggestions,
      source: process.env.GEMINI_API_KEY ? 'gemini' : 'mock'
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Fallback response
    const fallbackResponse = "I'm sorry, I'm having trouble processing your request right now. Please try asking about your spending by category, recent transactions, or general budgeting tips.";
    
    res.json({ 
      response: fallbackResponse,
      suggestions: ['Show my spending patterns', 'Budget tips', 'Savings advice'],
      source: 'fallback'
    });
  }
});

// Generate contextual suggestions
function generateSuggestions(message, context) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
    return [
      'What is the 50/30/20 rule?',
      'How can I track my expenses better?',
      'Show me my spending by category',
      'Budget planning tips'
    ];
  }
  
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return [
      'Emergency fund guidance',
      'Best savings accounts in India',
      'How to save tax under 80C?',
      'High-yield FD vs mutual funds'
    ];
  }
  
  if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
    return [
      'SIP in mutual funds explained',
      'ELSS tax saving schemes',
      'PPF vs NSC comparison',
      'Best investment apps in India'
    ];
  }
  
  if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
    return [
      'Debt payoff strategies',
      'Snowball vs avalanche method',
      'Credit score improvement',
      'Loan consolidation options'
    ];
  }
  
  return [
    'Analyze my financial health',
    'Monthly budget planning',
    'Savings goal setting',
    'Investment opportunities'
  ];
}

// Mock response function for when Gemini API is not available
function generateMockResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('balance') || lowerMessage.includes('money left')) {
    return `💰 Your current balance is ₹${context.balance.toFixed(2)}. ${context.balance > 0 ? "You're doing great with your finances! 🎉" : "Consider reviewing your expenses to improve your balance. 📊"}`;
  }
  
  if (lowerMessage.includes('spending') || lowerMessage.includes('expenses')) {
    const topCategory = context.topCategories[0];
    return `📈 Your total expenses are ₹${context.totalExpenses.toFixed(2)}. Your biggest spending category is ${topCategory?._id || 'unknown'} at ₹${topCategory?.total.toFixed(2) || 0}. Consider tracking this category more closely! 🔍`;
  }
  
  if (lowerMessage.includes('income')) {
    return `💵 Your total income is ₹${context.totalIncome.toFixed(2)}. ${context.totalIncome > context.totalExpenses ? "Your income exceeds your expenses, which is excellent! 🌟" : "Consider finding ways to increase your income or reduce expenses. 💡"}`;
  }
  
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return `🏦 Based on your current financial situation, try to save at least 20% of your income. With your current balance of ₹${context.balance.toFixed(2)}, consider setting up automatic transfers to a savings account. Set up goals and track your progress! 🎯`;
  }
  
  if (lowerMessage.includes('budget')) {
    return `📋 For better budgeting, try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Review your spending categories regularly to stay on track. Your current balance suggests ${context.balance > 0 ? 'you\'re managing well!' : 'some adjustments might help.'} 💪`;
  }
  
  if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
    return `📈 Great question about investing! Start with these basics: 1) Pay off high-interest debt first, 2) Build an emergency fund (3-6 months expenses), 3) Consider SIP in mutual funds, 4) Look into ELSS for tax savings, 5) Diversify your portfolio. With your balance of ₹${context.balance.toFixed(2)}, ${context.balance > 50000 ? 'you might be ready to start SIP investing!' : 'focus on building your emergency fund first.'} Consider Indian options like PPF, NSC, and ELSS for tax benefits! 🚀`;
  }
  
  return `🤖 I can help you with questions about your balance (₹${context.balance.toFixed(2)}), spending patterns, savings goals, and budgeting tips. What would you like to know? Here are some things I can help with:\n\n💰 Financial Analysis\n📊 Budget Planning\n🎯 Savings Strategies\n📈 Investment Basics`;
}

export default router;
