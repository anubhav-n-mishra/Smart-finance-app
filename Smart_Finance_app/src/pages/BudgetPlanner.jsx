import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaChartPie, 
  FaExclamationTriangle, 
  FaEdit, 
  FaTrash, 
  FaSyncAlt,
  FaCalendarAlt,
  FaRupeeSign 
} from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { formatCurrency, formatIndianCurrency } from '../utils/currency';

const BudgetPlanner = () => {
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetAnalytics, setBudgetAnalytics] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    period: 'monthly',
    startDate: '',
    endDate: '',
    categories: [],
    alertThreshold: 80,
    notifications: {
      enabled: true,
      thresholdAlert: true,
      dailyReminder: false
    }
  });

  const defaultCategories = [
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
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F472B6', '#A78BFA'
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (selectedBudget) {
      fetchBudgetAnalytics(selectedBudget._id);
    }
  }, [selectedBudget]);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budgets');
      setBudgets(response.data);
      if (response.data.length > 0) {
        setSelectedBudget(response.data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setLoading(false);
    }
  };

  const fetchBudgetAnalytics = async (budgetId) => {
    try {
      const response = await api.get(`/budgets/${budgetId}/analytics`);
      setBudgetAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching budget analytics:', error);
    }
  };

  const syncBudgetSpending = async (budgetId) => {
    try {
      await api.put(`/budgets/${budgetId}/sync-spending`);
      fetchBudgets();
      if (selectedBudget && selectedBudget._id === budgetId) {
        fetchBudgetAnalytics(budgetId);
      }
    } catch (error) {
      console.error('Error syncing budget spending:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetData = {
        ...formData,
        categories: formData.categories.map(cat => ({
          ...cat,
          budgetAmount: parseFloat(cat.budgetAmount)
        }))
      };

      if (selectedBudget && showModal) {
        await api.put(`/budgets/${selectedBudget._id}`, budgetData);
      } else {
        await api.post('/budgets', budgetData);
      }

      setShowModal(false);
      resetForm();
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      name: budget.name,
      period: budget.period,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: new Date(budget.endDate).toISOString().split('T')[0],
      categories: budget.categories,
      alertThreshold: budget.alertThreshold,
      notifications: budget.notifications
    });
    setShowModal(true);
  };

  const handleDelete = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await api.delete(`/budgets/${budgetId}`);
        if (selectedBudget && selectedBudget._id === budgetId) {
          setSelectedBudget(budgets.find(b => b._id !== budgetId) || null);
        }
        fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      period: 'monthly',
      startDate: '',
      endDate: '',
      categories: [],
      alertThreshold: 80,
      notifications: {
        enabled: true,
        thresholdAlert: true,
        dailyReminder: false
      }
    });
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [
        ...formData.categories,
        { name: 'Food & Dining', budgetAmount: 0, isActive: true }
      ]
    });
  };

  const updateCategory = (index, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index][field] = value;
    setFormData({ ...formData, categories: updatedCategories });
  };

  const removeCategory = (index) => {
    const updatedCategories = formData.categories.filter((_, i) => i !== index);
    setFormData({ ...formData, categories: updatedCategories });
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
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
            <h1 className="text-3xl font-bold text-gray-800">Budget Planner</h1>
            <p className="text-gray-600">Plan and track your spending</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            New Budget
          </button>
        </div>

        {budgets.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <FaChartPie className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Budgets Created</h3>
            <p className="text-gray-500 mb-6">Start by creating your first budget plan</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budget List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Your Budgets</h2>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {budgets.map((budget) => (
                    <div
                      key={budget._id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedBudget?._id === budget._id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedBudget(budget)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800">{budget.name}</h3>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              syncBudgetSpending(budget._id);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Sync spending"
                          >
                            <FaSyncAlt size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(budget);
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(budget._id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 capitalize mb-2">
                        <FaCalendarAlt className="inline mr-1" />
                        {budget.period}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {formatIndianCurrency(budget.totalSpent)} / {formatIndianCurrency(budget.totalBudget)}
                        </span>
                        <span className={`text-sm font-bold ${getUsageColor(budget.usagePercentage)}`}>
                          {budget.usagePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(budget.usagePercentage)}`}
                          style={{ width: `${Math.min(budget.usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                      {budget.usagePercentage >= budget.alertThreshold && (
                        <div className="mt-2 text-xs text-orange-600 flex items-center">
                          <FaExclamationTriangle className="mr-1" />
                          Budget Alert!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Analytics */}
            <div className="lg:col-span-2">
              {selectedBudget && budgetAnalytics ? (
                <div className="space-y-6">
                  {/* Budget Overview */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800">{selectedBudget.name}</h2>
                      <button
                        onClick={() => syncBudgetSpending(selectedBudget._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <FaSyncAlt className="mr-1" />
                        Sync
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatIndianCurrency(budgetAnalytics.budget.totalBudget)}
                        </p>
                        <p className="text-sm text-gray-600">Total Budget</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {formatIndianCurrency(budgetAnalytics.budget.totalSpent)}
                        </p>
                        <p className="text-sm text-gray-600">Total Spent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {formatIndianCurrency(budgetAnalytics.budget.remainingBudget)}
                        </p>
                        <p className="text-sm text-gray-600">Remaining</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getUsageColor(budgetAnalytics.budget.usagePercentage)}`}>
                          {budgetAnalytics.budget.usagePercentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">Usage</p>
                      </div>
                    </div>

                    {/* Health Metrics */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">Budget Health</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Days Elapsed</p>
                          <p className="font-semibold">{budgetAnalytics.healthMetrics.daysElapsed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Days Remaining</p>
                          <p className="font-semibold">{budgetAnalytics.healthMetrics.daysRemaining}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Daily Rate</p>
                          <p className="font-semibold">
                            {formatIndianCurrency(budgetAnalytics.healthMetrics.dailySpendingRate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Projected Total</p>
                          <p className={`font-semibold ${budgetAnalytics.healthMetrics.isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                            {formatIndianCurrency(budgetAnalytics.healthMetrics.projectedSpending)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Recommended Daily</p>
                          <p className="font-semibold text-blue-600">
                            {formatIndianCurrency(budgetAnalytics.healthMetrics.recommendedDailySpending)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className={`font-semibold ${budgetAnalytics.healthMetrics.isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                            {budgetAnalytics.healthMetrics.isOnTrack ? '✅ On Track' : '⚠️ Over Budget'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pie Chart */}
                      <div>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={budgetAnalytics.categoryAnalysis.filter(cat => cat.spentAmount > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="spentAmount"
                            >
                              {budgetAnalytics.categoryAnalysis.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatIndianCurrency(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Category List */}
                      <div className="space-y-3">
                        {budgetAnalytics.categoryAnalysis.map((category, index) => (
                          <div key={category.name} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-gray-800">{category.name}</h4>
                              <span className={`text-sm font-bold ${getUsageColor(category.usagePercentage)}`}>
                                {category.usagePercentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>₹{category.spentAmount.toFixed(2)} / ₹{category.budgetAmount.toFixed(2)}</span>
                              <span className="text-gray-500">
                                ₹{category.remainingAmount.toFixed(2)} left
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getProgressBarColor(category.usagePercentage)}`}
                                style={{ width: `${Math.min(category.usagePercentage, 100)}%` }}
                              ></div>
                            </div>
                            {category.isOverBudget && (
                              <p className="text-xs text-red-600 mt-1">
                                ⚠️ Over budget by ₹{category.overBudgetAmount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Daily Spending Trend */}
                  {budgetAnalytics.dailySpending.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Spending Trend</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={budgetAnalytics.dailySpending}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="_id" />
                          <YAxis tickFormatter={(value) => `₹${value}`} />
                          <Tooltip formatter={(value) => [formatIndianCurrency(value), 'Amount']} />
                          <Bar dataKey="dailyTotal" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : selectedBudget ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading budget analytics...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center py-8">
                    <FaChartPie className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Select a budget to view analytics</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budget Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {selectedBudget && showModal ? 'Edit Budget' : 'New Budget'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Monthly Budget 2024"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Period
                      </label>
                      <select
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {periods.map((period) => (
                          <option key={period.value} value={period.value}>
                            {period.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={formData.startDate}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alert Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={formData.alertThreshold}
                      onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="100"
                      placeholder="80"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get alerts when spending reaches this percentage</p>
                  </div>

                  {/* Categories */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Budget Categories
                      </label>
                      <button
                        type="button"
                        onClick={addCategory}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Add Category
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {formData.categories.map((category, index) => (
                        <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                          <select
                            value={category.name}
                            onChange={(e) => updateCategory(index, 'name', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            {defaultCategories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={category.budgetAmount}
                            onChange={(e) => updateCategory(index, 'budgetAmount', parseFloat(e.target.value) || 0)}
                            className="w-32 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Amount"
                            min="0"
                          />
                          <button
                            type="button"
                            onClick={() => removeCategory(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                    {formData.categories.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No categories added yet. Click "Add Category" to start.
                      </p>
                    )}
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Settings
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notifications.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            notifications: { ...formData.notifications, enabled: e.target.checked }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Enable notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notifications.thresholdAlert}
                          onChange={(e) => setFormData({
                            ...formData,
                            notifications: { ...formData.notifications, thresholdAlert: e.target.checked }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Alert when threshold reached</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notifications.dailyReminder}
                          onChange={(e) => setFormData({
                            ...formData,
                            notifications: { ...formData.notifications, dailyReminder: e.target.checked }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Daily spending reminder</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={formData.categories.length === 0}
                    >
                      {selectedBudget && showModal ? 'Update Budget' : 'Create Budget'}
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

export default BudgetPlanner;
