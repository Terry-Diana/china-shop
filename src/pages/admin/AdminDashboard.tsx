import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Users, Package, DollarSign,
  ArrowUp, ArrowDown, Clock, TrendingUp,
  Eye, AlertCircle, CheckCircle, Truck
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const COLORS = ['#013352', '#024d79', '#0072b1', '#00a3ff', '#bb313e', '#d93c4b'];

// Mock data for demonstration
const salesData = [
  { name: 'Jan', sales: 45000, orders: 124, users: 89 },
  { name: 'Feb', sales: 52000, orders: 145, users: 102 },
  { name: 'Mar', sales: 48000, orders: 132, users: 95 },
  { name: 'Apr', sales: 61000, orders: 167, users: 118 },
  { name: 'May', sales: 55000, orders: 151, users: 108 },
  { name: 'Jun', sales: 67000, orders: 189, users: 134 },
  { name: 'Jul', sales: 72000, orders: 203, users: 145 }
];

const categoryData = [
  { name: 'Electronics', value: 35, sales: 245000, color: COLORS[0] },
  { name: 'Fashion', value: 25, sales: 175000, color: COLORS[1] },
  { name: 'Home & Garden', value: 20, sales: 140000, color: COLORS[2] },
  { name: 'Sports', value: 12, sales: 84000, color: COLORS[3] },
  { name: 'Beauty', value: 8, sales: 56000, color: COLORS[4] }
];

const recentOrders = [
  { id: '#ORD-001', customer: 'John Doe', amount: 1250, status: 'completed', time: '2 min ago' },
  { id: '#ORD-002', customer: 'Sarah Johnson', amount: 890, status: 'processing', time: '5 min ago' },
  { id: '#ORD-003', customer: 'Mike Wilson', amount: 2100, status: 'shipped', time: '12 min ago' },
  { id: '#ORD-004', customer: 'Emma Davis', amount: 675, status: 'pending', time: '18 min ago' },
  { id: '#ORD-005', customer: 'Alex Brown', amount: 1450, status: 'completed', time: '25 min ago' }
];

const topProducts = [
  { name: 'Wireless Headphones', sales: 1250, revenue: 87500, trend: 'up' },
  { name: 'Smart Watch', sales: 890, revenue: 62300, trend: 'up' },
  { name: 'Running Shoes', sales: 756, revenue: 52920, trend: 'down' },
  { name: 'Cotton T-Shirt', sales: 634, revenue: 19020, trend: 'up' },
  { name: 'Laptop Stand', sales: 445, revenue: 31150, trend: 'up' }
];

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const { admin } = useAdminAuth();
  const { stats } = useRealTimeData();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-success" />;
      case 'processing': return <Clock size={16} className="text-warning" />;
      case 'shipped': return <Truck size={16} className="text-primary" />;
      case 'pending': return <AlertCircle size={16} className="text-gray-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-50 text-success border-success-200';
      case 'processing': return 'bg-warning-50 text-warning border-warning-200';
      case 'shipped': return 'bg-primary-50 text-primary border-primary-200';
      case 'pending': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 text-white">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        <div className="relative">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {admin?.name || 'Admin'}! 👋
          </h1>
          <p className="text-primary-100 mb-4">
            Here's what's happening with China Square today.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Real-time data active
            </div>
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: 'Ksh 2,847,500',
            change: '+12.5%',
            icon: <DollarSign size={24} />,
            positive: true,
            description: 'vs last month'
          },
          {
            title: 'Orders Today',
            value: '156',
            change: '+8.2%',
            icon: <ShoppingBag size={24} />,
            positive: true,
            description: 'vs yesterday'
          },
          {
            title: 'Active Users',
            value: '2,847',
            change: '+15.3%',
            icon: <Users size={24} />,
            positive: true,
            description: 'vs last week'
          },
          {
            title: 'Products Sold',
            value: '1,247',
            change: '+5.7%',
            icon: <Package size={24} />,
            positive: true,
            description: 'this month'
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-50 rounded-lg">
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
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sales Overview</h2>
              <p className="text-sm text-gray-600">Revenue and order trends</p>
            </div>
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
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#013352" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#013352" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'sales' ? `Ksh ${value.toLocaleString()}` : value,
                    name === 'sales' ? 'Sales' : 'Orders'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#013352" 
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sales by Category</h2>
              <p className="text-sm text-gray-600">Revenue distribution</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% (Ksh ${props.payload.sales.toLocaleString()})`,
                    'Share'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-600 truncate">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-600">Latest customer orders</p>
            </div>
            <button className="text-primary hover:text-primary-dark text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Ksh {order.amount.toLocaleString()}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-gray-500">{order.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
              <p className="text-sm text-gray-600">Best performing items</p>
            </div>
            <button className="text-primary hover:text-primary-dark text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Ksh {product.revenue.toLocaleString()}</p>
                  <div className="flex items-center justify-end">
                    {product.trend === 'up' ? (
                      <TrendingUp size={14} className="text-success mr-1" />
                    ) : (
                      <ArrowDown size={14} className="text-error mr-1" />
                    )}
                    <span className={`text-xs ${product.trend === 'up' ? 'text-success' : 'text-error'}`}>
                      {product.trend === 'up' ? '+' : '-'}12%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Product', icon: <Package size={20} />, color: 'bg-primary' },
            { label: 'View Orders', icon: <ShoppingBag size={20} />, color: 'bg-accent' },
            { label: 'Manage Users', icon: <Users size={20} />, color: 'bg-success' },
            { label: 'Analytics', icon: <TrendingUp size={20} />, color: 'bg-warning' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
            >
              {action.icon}
              <span className="font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;