import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FaDollarSign, FaArrowUp, FaArrowDown, FaCreditCard, FaCalendarAlt, FaDownload } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [chartType, setChartType] = useState('pie');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, categoriesResponse, trendsResponse] = await Promise.all([
        dashboardAPI.getStats({ period: selectedPeriod }),
        dashboardAPI.getCategories({ period: selectedPeriod }),
        dashboardAPI.getTrends({ months: 6 })
      ]);

      setStats(statsResponse.data);
      setCategoryData(categoriesResponse.data);
      setTrendsData(trendsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  const formatTrendsData = (data) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const groupedData = {};
    
    data.forEach(item => {
      const monthYear = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      if (!groupedData[monthYear]) {
        groupedData[monthYear] = { month: monthYear, income: 0, expense: 0 };
      }
      groupedData[monthYear][item._id.type] = item.total;
    });
    
    return Object.values(groupedData);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Category,Amount,Type\n"
      + categoryData.map(item => `${item._id},${item.total},${item.type || 'expense'}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const formattedTrendsData = formatTrendsData(trendsData);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={exportData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
            >
              <FaDownload className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-gradient-to-r from-green-400 to-green-600 overflow-hidden shadow-lg rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaArrowUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-green-100 truncate">Total Income</dt>
                    <dd className="text-2xl font-bold text-white">
                      ₹{stats?.summary?.totalIncome?.toFixed(2) || '0.00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-400 to-red-600 overflow-hidden shadow-lg rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaArrowDown className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-red-100 truncate">Total Expenses</dt>
                    <dd className="text-2xl font-bold text-white">
                      ₹{stats?.summary?.totalExpenses?.toFixed(2) || '0.00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-r ${stats?.summary?.balance >= 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'} overflow-hidden shadow-lg rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaDollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-blue-100 truncate">Net Balance</dt>
                    <dd className="text-2xl font-bold text-white">
                      ₹{stats?.summary?.balance?.toFixed(2) || '0.00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-400 to-purple-600 overflow-hidden shadow-lg rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-purple-100 truncate">Transactions</dt>
                    <dd className="text-2xl font-bold text-white">
                      {stats?.recentTransactions?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Spending by Category</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-3 py-1 text-xs rounded ${chartType === 'pie' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Pie
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Bar
                </button>
              </div>
            </div>
            
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="_id"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                ) : (
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="_id" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No spending data available
              </div>
            )}
          </div>

          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Income vs Expenses Trend</h3>
            {formattedTrendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Income"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No trend data available
              </div>
            )}
          </div>
        </div>

        {/* Financial Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Insights */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Insights</h3>
            <div className="space-y-4">
              {stats?.summary?.balance > 0 ? (
                <div className="flex items-center p-3 bg-green-50 rounded-md">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-sm text-green-800">
                    Great job! You're spending less than you earn this period.
                  </p>
                </div>
              ) : (
                <div className="flex items-center p-3 bg-red-50 rounded-md">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-sm text-red-800">
                    You're spending more than you earn. Consider reviewing your expenses.
                  </p>
                </div>
              )}
              
              {categoryData.length > 0 && (
                <div className="flex items-center p-3 bg-blue-50 rounded-md">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-sm text-blue-800">
                    Your highest spending category is <strong>{categoryData[0]._id}</strong> at ${categoryData[0].total.toFixed(2)}.
                  </p>
                </div>
              )}
              
              {stats?.summary?.totalIncome > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 rounded-md">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-sm text-yellow-800">
                    Your savings rate is {((stats?.summary?.balance / stats?.summary?.totalIncome) * 100).toFixed(1)}%.
                    {((stats?.summary?.balance / stats?.summary?.totalIncome) * 100) < 20 ? ' Try to save at least 20% of your income.' : ' Excellent savings rate!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats?.recentTransactions?.length > 0 ? (
                stats.recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description || transaction.category.replace('-', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <FaCreditCard className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No recent transactions</p>
                  <p className="text-xs">Start by adding your first transaction!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
