import React, { useState, useEffect } from 'react';
import { FaPlus, FaBullseye, FaClock, FaArrowUp, FaEdit, FaTrash, FaRupeeSign } from 'react-icons/fa';
import { api } from '../services/api';
import { formatCurrency, formatIndianCurrency } from '../utils/currency';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'other',
    priority: 'medium',
    monthlyContribution: '',
    autoContribute: false,
    reminderFrequency: 'monthly'
  });
  const [contributionData, setContributionData] = useState({
    amount: '',
    note: ''
  });

  const categories = [
    { value: 'emergency-fund', label: '🚨 Emergency Fund', color: 'bg-red-500' },
    { value: 'vacation', label: '🏖️ Vacation', color: 'bg-blue-500' },
    { value: 'home-purchase', label: '🏠 Home Purchase', color: 'bg-green-500' },
    { value: 'vehicle', label: '🚗 Vehicle', color: 'bg-yellow-500' },
    { value: 'education', label: '📚 Education', color: 'bg-purple-500' },
    { value: 'wedding', label: '💒 Wedding', color: 'bg-pink-500' },
    { value: 'retirement', label: '🏖️ Retirement', color: 'bg-indigo-500' },
    { value: 'investment', label: '📈 Investment', color: 'bg-teal-500' },
    { value: 'debt-payoff', label: '💳 Debt Payoff', color: 'bg-orange-500' },
    { value: 'other', label: '🎯 Other', color: 'bg-gray-500' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/savings-goals');
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/savings-goals/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching savings stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        monthlyContribution: parseFloat(formData.monthlyContribution) || 0
      };

      if (selectedGoal) {
        await api.put(`/savings-goals/${selectedGoal._id}`, goalData);
      } else {
        await api.post('/savings-goals', goalData);
      }

      setShowModal(false);
      setSelectedGoal(null);
      setFormData({
        title: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        category: 'other',
        priority: 'medium',
        monthlyContribution: '',
        autoContribute: false,
        reminderFrequency: 'monthly'
      });
      fetchGoals();
      fetchStats();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/savings-goals/${selectedGoal._id}/contribute`, {
        amount: parseFloat(contributionData.amount),
        note: contributionData.note
      });

      setShowContributeModal(false);
      setSelectedGoal(null);
      setContributionData({ amount: '', note: '' });
      fetchGoals();
      fetchStats();
    } catch (error) {
      console.error('Error adding contribution:', error);
    }
  };

  const handleEdit = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetAmount: goal.targetAmount.toString(),
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      category: goal.category,
      priority: goal.priority,
      monthlyContribution: goal.monthlyContribution.toString(),
      autoContribute: goal.autoContribute,
      reminderFrequency: goal.reminderFrequency
    });
    setShowModal(true);
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await api.delete(`/savings-goals/${goalId}`);
        fetchGoals();
        fetchStats();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[categories.length - 1];
  };

  const getPriorityInfo = (priorityValue) => {
    return priorities.find(p => p.value === priorityValue) || priorities[1];
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTimeStatus = (daysRemaining) => {
    if (daysRemaining === 0) return { text: 'Due Today', color: 'text-red-600' };
    if (daysRemaining < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (daysRemaining <= 30) return { text: `${daysRemaining} days left`, color: 'text-orange-600' };
    if (daysRemaining <= 90) return { text: `${daysRemaining} days left`, color: 'text-yellow-600' };
    return { text: `${daysRemaining} days left`, color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Savings Goals</h1>
            <p className="text-gray-600">Track and achieve your financial goals</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            New Goal
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Goals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGoals}</p>
                </div>
                <FaBullseye className="text-3xl text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedGoals}</p>
                </div>
                <FaArrowUp className="text-3xl text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Target Amount</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatIndianCurrency(stats.totalTargetAmount)}
                  </p>
                </div>
                <FaRupeeSign className="text-3xl text-indigo-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved So Far</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatIndianCurrency(stats.totalCurrentAmount)}
                  </p>
                </div>
                <FaClock className="text-3xl text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Overall Progress */}
        {stats && stats.totalTargetAmount > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Progress</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {formatIndianCurrency(stats.totalCurrentAmount)} / {formatIndianCurrency(stats.totalTargetAmount)}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {stats.overallProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(stats.overallProgress)}`}
                style={{ width: `${Math.min(stats.overallProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category);
            const priorityInfo = getPriorityInfo(goal.priority);
            const timeStatus = getTimeStatus(goal.daysRemaining);

            return (
              <div key={goal._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Category Header */}
                <div className={`${categoryInfo.color} text-white p-4`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{categoryInfo.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full bg-white bg-opacity-20 ${priorityInfo.color}`}>
                      {priorityInfo.label}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Goal Title & Description */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">
                        {goal.progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(goal.progressPercentage)}`}
                        style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current:</span>
                      <span className="text-sm font-semibold">
                        {formatIndianCurrency(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Target:</span>
                      <span className="text-sm font-semibold">
                        {formatIndianCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {formatIndianCurrency(goal.remainingAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Time Status */}
                  <div className={`text-sm font-medium mb-4 ${timeStatus.color}`}>
                    <FaClock className="inline mr-1" />
                    {timeStatus.text}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowContributeModal(true);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      disabled={goal.isCompleted}
                    >
                      Add Money
                    </button>
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-2 bg-red-200 text-red-600 rounded-lg hover:bg-red-300 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Completion Badge */}
                  {goal.isCompleted && (
                    <div className="mt-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-center">
                      🎉 Goal Achieved!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="text-center py-12">
            <FaBullseye className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Savings Goals Yet</h3>
            <p className="text-gray-500 mb-6">Start by creating your first savings goal</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}

        {/* Goal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {selectedGoal ? 'Edit Goal' : 'New Savings Goal'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Emergency Fund"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Description of your goal..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100000"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={formData.targetDate}
                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Contribution (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyContribution}
                      onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5000"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reminder Frequency
                    </label>
                    <select
                      value={formData.reminderFrequency}
                      onChange={(e) => setFormData({ ...formData, reminderFrequency: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="never">Never</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoContribute"
                      checked={formData.autoContribute}
                      onChange={(e) => setFormData({ ...formData, autoContribute: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="autoContribute" className="text-sm text-gray-700">
                      Enable auto-contribution
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedGoal(null);
                        setFormData({
                          title: '',
                          description: '',
                          targetAmount: '',
                          targetDate: '',
                          category: 'other',
                          priority: 'medium',
                          monthlyContribution: '',
                          autoContribute: false,
                          reminderFrequency: 'monthly'
                        });
                      }}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {selectedGoal ? 'Update Goal' : 'Create Goal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Contribute Modal */}
        {showContributeModal && selectedGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Add Money to {selectedGoal.title}
                </h2>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Current: <span className="font-semibold">{formatIndianCurrency(selectedGoal.currentAmount)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Target: <span className="font-semibold">{formatIndianCurrency(selectedGoal.targetAmount)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Remaining: <span className="font-semibold text-orange-600">{formatIndianCurrency(selectedGoal.remainingAmount)}</span>
                  </p>
                </div>
                <form onSubmit={handleContribute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={contributionData.amount}
                      onChange={(e) => setContributionData({ ...contributionData, amount: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1000"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={contributionData.note}
                      onChange={(e) => setContributionData({ ...contributionData, note: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Monthly savings"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowContributeModal(false);
                        setSelectedGoal(null);
                        setContributionData({ amount: '', note: '' });
                      }}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Money
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;
