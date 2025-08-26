import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: [
      'emergency-fund',
      'vacation',
      'home-purchase',
      'vehicle',
      'education',
      'wedding',
      'retirement',
      'investment',
      'debt-payoff',
      'other'
    ],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  monthlyContribution: {
    type: Number,
    default: 0,
    min: 0
  },
  autoContribute: {
    type: Boolean,
    default: false
  },
  contributions: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  reminderFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'never'],
    default: 'monthly'
  },
  nextReminder: Date
}, {
  timestamps: true
});

// Virtual for progress percentage
savingsGoalSchema.virtual('progressPercentage').get(function() {
  return this.targetAmount > 0 ? Math.min((this.currentAmount / this.targetAmount) * 100, 100) : 0;
});

// Virtual for remaining amount
savingsGoalSchema.virtual('remainingAmount').get(function() {
  return Math.max(this.targetAmount - this.currentAmount, 0);
});

// Virtual for days remaining
savingsGoalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - now;
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
});

// Pre-save middleware to update completion status
savingsGoalSchema.pre('save', function(next) {
  if (this.currentAmount >= this.targetAmount) {
    this.isCompleted = true;
  } else {
    this.isCompleted = false;
  }
  next();
});

// Index for better query performance
savingsGoalSchema.index({ userId: 1, isCompleted: 1 });
savingsGoalSchema.index({ targetDate: 1 });

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

export default SavingsGoal;
