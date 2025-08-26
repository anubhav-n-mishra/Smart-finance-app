import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaUsers, 
  FaDollarSign, 
  FaChartLine, 
  FaCog, 
  FaSearch, 
  FaFilter,
  FaDownload,
  FaEye,
  FaBan,
  FaCheck,
  FaTrash,
  FaEdit,
  FaPlus,
  FaUserShield,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Mock data - in real app, this would come from API
  const [dashboardStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalTransactions: 45678,
    totalRevenue: 234567.89,
    growthRate: 12.5,
    avgSessionTime: '8m 32s'
  });

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-15',
      totalTransactions: 45,
      totalSpent: 2340.50,
      lastLogin: '2024-01-25 10:30:00'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-10',
      totalTransactions: 67,
      totalSpent: 4567.25,
      lastLogin: '2024-01-24 15:45:00'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'user',
      status: 'suspended',
      joinDate: '2023-12-20',
      totalTransactions: 23,
      totalSpent: 1234.75,
      lastLogin: '2024-01-20 09:15:00'
    }
  ]);

  const [userGrowthData] = useState([
    { month: 'Sep', users: 450, active: 380 },
    { month: 'Oct', users: 520, active: 445 },
    { month: 'Nov', users: 680, active: 590 },
    { month: 'Dec', users: 890, active: 750 },
    { month: 'Jan', users: 1247, active: 892 }
  ]);

  const [transactionData] = useState([
    { date: '2024-01-20', amount: 12450 },
    { date: '2024-01-21', amount: 15200 },
    { date: '2024-01-22', amount: 9800 },
    { date: '2024-01-23', amount: 18900 },
    { date: '2024-01-24', amount: 22100 },
    { date: '2024-01-25', amount: 16750 }
  ]);

  const [categoryData] = useState([
    { name: 'Food & Dining', value: 35, color: '#8B5CF6' },
    { name: 'Transportation', value: 25, color: '#10B981' },
    { name: 'Shopping', value: 20, color: '#F59E0B' },
    { name: 'Entertainment', value: 12, color: '#EF4444' },
    { name: 'Others', value: 8, color: '#6B7280' }
  ]);

  const [systemLogs] = useState([
    { id: 1, action: 'User Registration', user: 'john@example.com', timestamp: '2024-01-25 10:30:00', status: 'success' },
    { id: 2, action: 'Password Reset', user: 'jane@example.com', timestamp: '2024-01-25 09:45:00', status: 'success' },
    { id: 3, action: 'Failed Login', user: 'mike@example.com', timestamp: '2024-01-25 08:20:00', status: 'warning' },
    { id: 4, action: 'Transaction Created', user: 'john@example.com', timestamp: '2024-01-25 07:15:00', status: 'info' }
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateUserStatus = (userId, newStatus) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const exportData = (type) => {
    // Mock export functionality
    const data = type === 'users' ? users : transactionData;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <FaBan className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
            <p className="text-red-600">You don't have permission to access the admin dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, monitor system performance, and view analytics</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: FaChartLine },
              { id: 'users', name: 'User Management', icon: FaUsers },
              { id: 'analytics', name: 'Analytics', icon: FaTrendingUp },
              { id: 'system', name: 'System Logs', icon: FaCog }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaUsers className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.totalUsers.toLocaleString()}</dd>
                        <dd className="text-sm text-green-600 flex items-center">
                          <FaArrowUp className="h-3 w-3 mr-1" />
                          +{dashboardStats.growthRate}% from last month
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaUserShield className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.activeUsers.toLocaleString()}</dd>
                        <dd className="text-sm text-gray-600">{((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100).toFixed(1)}% active rate</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaChartLine className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.totalTransactions.toLocaleString()}</dd>
                        <dd className="text-sm text-blue-600">Avg: {Math.round(dashboardStats.totalTransactions / dashboardStats.totalUsers)} per user</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaDollarSign className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Volume</dt>
                        <dd className="text-lg font-medium text-gray-900">₹{dashboardStats.totalRevenue.toLocaleString()}</dd>
                        <dd className="text-sm text-green-600">Avg session: {dashboardStats.avgSessionTime}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="active" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Transaction Volume */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Volume (Last 7 days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Bar dataKey="amount" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => exportData('users')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FaDownload className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                    <FaPlus className="h-4 w-4 mr-2" />
                    Add User
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : user.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.totalTransactions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{user.totalSpent.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FaEdit className="h-4 w-4" />
                          </button>
                          {user.status === 'active' ? (
                            <button 
                              onClick={() => updateUserStatus(user.id, 'suspended')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <FaBan className="h-4 w-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => updateUserStatus(user.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Trend */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Average Transaction</h4>
                <p className="text-2xl font-bold text-gray-900">₹127.45</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <FaArrowUp className="h-3 w-3 mr-1" />
                  +5.2% from last month
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 mb-2">User Retention</h4>
                <p className="text-2xl font-bold text-gray-900">78.5%</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <FaArrowDown className="h-3 w-3 mr-1" />
                  -2.1% from last month
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Support Tickets</h4>
                <p className="text-2xl font-bold text-gray-900">23</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <FaArrowDown className="h-3 w-3 mr-1" />
                  -15% from last month
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Logs Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent System Activity</h3>
                <p className="mt-1 text-sm text-gray-500">Monitor system events and user activities</p>
              </div>
              <ul className="divide-y divide-gray-200">
                {systemLogs.map((log) => (
                  <li key={log.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mr-3 ${
                          log.status === 'success' ? 'bg-green-400' :
                          log.status === 'warning' ? 'bg-yellow-400' :
                          log.status === 'error' ? 'bg-red-400' : 'bg-blue-400'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-sm text-gray-500">{log.user}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
