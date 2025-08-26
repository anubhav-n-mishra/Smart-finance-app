import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Tip from '../models/Tip.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (block/unblock)
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also delete user's transactions
    await Transaction.deleteMany({ userId: req.params.id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get platform analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalTransactions = await Transaction.countDocuments();

    // Get user registration trends (last 12 months)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const userTrends = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get most popular expense categories
    const popularCategories = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      summary: {
        totalUsers,
        activeUsers,
        totalTransactions
      },
      userTrends,
      popularCategories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tips management
router.get('/tips', async (req, res) => {
  try {
    const tips = await Tip.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tips', async (req, res) => {
  try {
    const tip = new Tip({
      ...req.body,
      createdBy: req.user._id
    });

    await tip.save();
    await tip.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Tip created successfully',
      tip
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/tips/:id', async (req, res) => {
  try {
    const tip = await Tip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    res.json({
      message: 'Tip updated successfully',
      tip
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/tips/:id', async (req, res) => {
  try {
    const tip = await Tip.findByIdAndDelete(req.params.id);
    
    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    res.json({ message: 'Tip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
