import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Users, Package,
  ArrowUp, ArrowDown, DollarSign, Clock,
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer
} from 'recharts';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { adminService } from '../../services/adminService';
import { AnalyticsData } from '../../types/admin';

const COLORS = ['#013352', '#024d79', '#0072b1', '#00a3ff'];

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats, loading: statsLoading } = useRealTimeData();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const salesData = [
    { name: 'Jan', sales: 4000, orders: 24 },
    { name: 'Feb', sales: 3000, orders: 18 },
    { name: 'Mar', sales: 2000, orders: 12 },
    { name: 'Apr', sales: 2780, orders: 16 },
    { name: 'May', sales: 1890, orders: 11 },
    { name: 'Jun', sales: 2390, orders: 14 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400, color: COLORS[0] },
    { name: 'Fashion', value: 300, color: COLORS[1] },
    { name: 'Home', value: 300, color: COLORS[2] },
    { name: 'Beauty', value: 200, color: COLORS[3] },
  ];

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-gray-600">
        <p className="text-lg font-semibold">Failed to load analytics data.</p>
        <p className="text-sm mt-2">Please try again later or check your internet connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-primary-100">Here's what's happening with your store today.</p>
        {stats && (
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Real-time data active
            </div>
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: `Ksh ${analyticsData.overview.totalRevenue?.toLocaleString() || '0'}`,
            change: '+12.5%',
            icon: <DollarSign size={24} />,
            positive: true,
            realTime: false,
          },
          {
            title: 'Orders Today',
            value: stats?.todayOrders?.toString() || '0',
            change: '+8.2%',
            icon: <ShoppingBag size={24} />,
            positive: true,
            realTime: true,
          },
          {
            title: 'New Users Today',
            value: stats?.todayUsers?.toString() || '0',
            change: '+15.3%',
            icon: <Users size={24} />,
            positive: true,
            realTime: true,
          },
          {
            title: 'Total Products',
            value: `Ksh ${analyticsData?.overview?.totalRevenue?.toLocaleString() || '0'}`,
            change: '+2.1%',
            icon: <Package size={24} />,
            positive: true,
            realTime: false,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 relative"
          >
            {stat.realTime && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <div className="text-primary">{stat.icon}</div>
              </div>
              <div className={`flex items-center ${stat.positive ? 'text-success' : 'text-error'}`}>
                {stat.positive ? (
                  <ArrowUp size={16} className="mr-1" />
                ) : (
                  <ArrowDown size={16} className="mr-1" />
                )}
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Sales Overview</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'sales'
                      ? [`Ksh ${value}`, 'Sales']
                      : [value, 'Orders']
                  }
                />
                <Line type="monotone" dataKey="sales" stroke="#013352" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="orders" stroke="#bb313e" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Sales by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {stats.recentActivity.map((activity, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 bg-primary-50 rounded-md"
              >
                console.log('Analytics Data:', analyticsData);

                <div>
                  <p className="text-sm font-medium text-primary">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.users ? 
                      `${activity.users.first_name || ''} ${activity.users.last_name || ''}`.trim() : 
                      'Unknown User'
                    }
                  </p>
                </div>
                <Clock size={16} className="text-gray-400" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;