import { ReactNode } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Boxes,
  LayoutTemplate,
  BarChart3,
  LogOut,
  Menu,
  X,
  UserPlus,
  Users,
  ShoppingCart,
  Settings,
  Bell,
} from 'lucide-react';
import Logo from '../ui/Logo';
import { useState } from 'react';
import RegisterAdminModal from './RegisterAdminModal';
import Button from '../ui/Button';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useRealTimeData } from '../../hooks/useRealTimeData';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const { stats } = useRealTimeData();

  const menuItems = [
    { 
      path: '/admin', 
      icon: <LayoutDashboard size={20} />, 
      label: 'Dashboard',
      badge: stats?.todayOrders || 0
    },
    { 
      path: '/admin/products', 
      icon: <Package size={20} />, 
      label: 'Products' 
    },
    { 
      path: '/admin/inventory', 
      icon: <Boxes size={20} />, 
      label: 'Inventory' 
    },
    { 
      path: '/admin/orders', 
      icon: <ShoppingCart size={20} />, 
      label: 'Orders',
      badge: stats?.todayOrders || 0
    },
    { 
      path: '/admin/users', 
      icon: <Users size={20} />, 
      label: 'Users',
      badge: stats?.todayUsers || 0
    },
    { 
      path: '/admin/cms', 
      icon: <LayoutTemplate size={20} />, 
      label: 'CMS' 
    },
    { 
      path: '/admin/analytics', 
      icon: <BarChart3 size={20} />, 
      label: 'Analytics' 
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 border-b">
          <Logo className="h-8" />
          <div className="mt-2 text-xs text-gray-500">Admin Portal</div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  location.pathname === item.path
                    ? 'bg-white text-primary'
                    : 'bg-accent text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 border-t">
          {admin?.role === 'super_admin' && (
            <Button
              variant="outline"
              fullWidth
              icon={<UserPlus size={18} />}
              onClick={() => setShowRegisterModal(true)}
            >
              Register Admin
            </Button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Real-time indicators */}
              {stats && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live Data
                  </div>
                  <div className="text-gray-600">
                    Today: {stats.todayOrders} orders, {stats.todayUsers} users
                  </div>
                </div>
              )}
              
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} />
                {stats && stats.todayOrders > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.todayOrders}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {admin?.name || 'Admin User'}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {admin?.role?.replace('_', ' ')}
                  </div>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Register Admin Modal */}
      {showRegisterModal && (
        <RegisterAdminModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
};

export default AdminLayout;