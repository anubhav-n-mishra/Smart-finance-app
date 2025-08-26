import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  categories: [{
    name: {
      type: String,
      required: true,
      enum: [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Education',
        'Travel',
        'Investment',
        'Insurance',
        'Rent/EMI',
        'Groceries',
        'Other'
      ]
    },
    budgetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  alertThreshold: {
    type: Number,
    default: 80, // Alert when 80% of budget is used
    min: 1,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    thresholdAlert: {
      type: Boolean,
      default: true
    },
    dailyReminder: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Virtual for budget usage percentage
budgetSchema.virtual('usagePercentage').get(function() {
  return this.totalBudget > 0 ? Math.min((this.totalSpent / this.totalBudget) * 100, 100) : 0;
});

// Virtual for remaining budget
budgetSchema.virtual('remainingBudget').get(function() {
  return Math.max(this.totalBudget - this.totalSpent, 0);
});

// Index for better query performance
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ startDate: 1, endDate: 1 });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
