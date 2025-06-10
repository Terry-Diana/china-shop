import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  MoreHorizontal,
  MapPin,
  CreditCard,
  User
} from 'lucide-react';
import Button from '../../components/ui/Button';

// Mock orders data
const mockOrders = [
  {
    id: 1,
    orderNumber: 'ORD-2024-001',
    customer: { name: 'John Doe', email: 'john@example.com', phone: '+254 700 123 456' },
    items: [
      { name: 'Wireless Headphones', quantity: 1, price: 7499.99 },
      { name: 'Phone Case', quantity: 2, price: 1299.99 }
    ],
    status: 'pending',
    total: 10099.97,
    subtotal: 8620.68,
    tax: 1379.31,
    shipping: 500,
    paymentMethod: 'M-Pesa',
    shippingAddress: {
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'Nairobi',
      state: 'Nairobi County',
      postalCode: '00100',
      country: 'Kenya'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    orderNumber: 'ORD-2024-002',
    customer: { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+254 700 234 567' },
    items: [
      { name: 'Smart Watch', quantity: 1, price: 6499.99 }
    ],
    status: 'processing',
    total: 7499.99,
    subtotal: 6499.99,
    tax: 1000.00,
    shipping: 0,
    paymentMethod: 'Card',
    shippingAddress: {
      line1: '456 Oak Avenue',
      city: 'Mombasa',
      state: 'Mombasa County',
      postalCode: '80100',
      country: 'Kenya'
    },
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-15T09:20:00Z'
  },
  {
    id: 3,
    orderNumber: 'ORD-2024-003',
    customer: { name: 'Mike Wilson', email: 'mike@example.com', phone: '+254 700 345 678' },
    items: [
      { name: 'Running Shoes', quantity: 1, price: 5999.99 },
      { name: 'Sports Socks', quantity: 3, price: 899.99 }
    ],
    status: 'shipped',
    total: 8699.96,
    subtotal: 8699.96,
    tax: 0,
    shipping: 0,
    paymentMethod: 'M-Pesa',
    trackingNumber: 'TRK123456789',
    shippingAddress: {
      line1: '789 Pine Road',
      city: 'Kisumu',
      state: 'Kisumu County',
      postalCode: '40100',
      country: 'Kenya'
    },
    createdAt: '2024-01-13T11:20:00Z',
    updatedAt: '2024-01-14T16:30:00Z'
  },
  {
    id: 4,
    orderNumber: 'ORD-2024-004',
    customer: { name: 'Emma Davis', email: 'emma@example.com', phone: '+254 700 456 789' },
    items: [
      { name: 'Cotton T-Shirt', quantity: 2, price: 1499.99 }
    ],
    status: 'delivered',
    total: 2999.98,
    subtotal: 2999.98,
    tax: 0,
    shipping: 0,
    paymentMethod: 'Card',
    trackingNumber: 'TRK987654321',
    shippingAddress: {
      line1: '321 Cedar Lane',
      city: 'Eldoret',
      state: 'Uasin Gishu County',
      postalCode: '30100',
      country: 'Kenya'
    },
    createdAt: '2024-01-12T14:15:00Z',
    updatedAt: '2024-01-15T08:45:00Z'
  },
  {
    id: 5,
    orderNumber: 'ORD-2024-005',
    customer: { name: 'Alex Brown', email: 'alex@example.com', phone: '+254 700 567 890' },
    items: [
      { name: 'Laptop Stand', quantity: 1, price: 3499.99 }
    ],
    status: 'cancelled',
    total: 3499.99,
    subtotal: 3499.99,
    tax: 0,
    shipping: 0,
    paymentMethod: 'M-Pesa',
    shippingAddress: {
      line1: '654 Birch Street',
      city: 'Nakuru',
      state: 'Nakuru County',
      postalCode: '20100',
      country: 'Kenya'
    },
    createdAt: '2024-01-11T09:30:00Z',
    updatedAt: '2024-01-11T10:15:00Z'
  }
];

const AdminOrders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
      setLoading(false);
      
      // Show success message
      alert(`Order status updated to ${newStatus}!`);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-warning" />;
      case 'processing':
        return <Package size={16} className="text-primary" />;
      case 'shipped':
        return <Truck size={16} className="text-blue-600" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-success" />;
      case 'cancelled':
        return <AlertCircle size={16} className="text-error" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-50 text-warning border-warning-200';
      case 'processing':
        return 'bg-primary-50 text-primary border-primary-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'delivered':
        return 'bg-success-50 text-success border-success-200';
      case 'cancelled':
        return 'bg-error-50 text-error border-error-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportOrders = () => {
    const csvContent = [
      'Order Number,Customer,Email,Status,Total,Date',
      ...filteredOrders.map(order => 
        `${order.orderNumber},${order.customer.name},${order.customer.email},${order.status},${order.total},${new Date(order.createdAt).toLocaleDateString()}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <Button
          variant="outline"
          icon={<Download size={18} />}
          onClick={exportOrders}
        >
          Export Orders
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { title: 'Total Orders', value: orders.length, status: 'all', color: 'primary' },
          { title: 'Pending', value: orders.filter(o => o.status === 'pending').length, status: 'pending', color: 'warning' },
          { title: 'Processing', value: orders.filter(o => o.status === 'processing').length, status: 'processing', color: 'primary' },
          { title: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, status: 'shipped', color: 'blue' },
          { title: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, status: 'delivered', color: 'success' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${
              statusFilter === stat.status ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setStatusFilter(stat.status)}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by order number, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Ksh {order.total.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={loading}
                        className={`text-xs font-medium rounded-full border px-2 py-1 ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-primary`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary hover:text-primary-dark transition-colors"
                      title="View Order Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">No orders match your current filters.</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                  <p className="text-gray-600">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Info */}
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <User size={18} className="mr-2" />
                      Customer Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Name:</strong> {selectedOrder.customer.name}</p>
                      <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <MapPin size={18} className="mr-2" />
                      Shipping Address
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{selectedOrder.shippingAddress.line1}</p>
                      {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.postalCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <CreditCard size={18} className="mr-2" />
                      Payment Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Method:</strong> {selectedOrder.paymentMethod}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </p>
                      {selectedOrder.trackingNumber && (
                        <p><strong>Tracking:</strong> {selectedOrder.trackingNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items & Summary */}
                <div className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            Ksh {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>Ksh {selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      {selectedOrder.tax > 0 && (
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>Ksh {selectedOrder.tax.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{selectedOrder.shipping === 0 ? 'Free' : `Ksh ${selectedOrder.shipping.toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span>Ksh {selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-success rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium">Order Placed</p>
                          <p className="text-xs text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {selectedOrder.status !== 'pending' && (
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-success rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium">Status Updated</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;