import { useState, useEffect, useRef } from 'react';
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
  MapPin,
  CreditCard,
  User
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

// Define proper types
interface OrderUser {
  first_name?: string;
  last_name?: string;
  email: string;
}

interface OrderProduct {
  name: string;
  image_url: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  products: OrderProduct;
}

interface Order {
  id: number;
  tracking_number: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  users: OrderUser | null;
  order_items: OrderItem[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const fetchRef = useRef<() => Promise<void>>();

  // Define fetch function
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          users:user_id (first_name, last_name, email),
          order_items (
            id,
            quantity,
            price,
            products:product_id (name, image_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Cast to Order array and ensure user data exists
      const typedData = (data as Order[] | null)?.map(order => ({
        ...order,
        users: order.users || null
      })) || [];
      
      console.log("Fetched orders:", typedData);
      setOrders(typedData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Store fetch function in ref
  useEffect(() => {
    fetchRef.current = fetchOrders;
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRef.current?.();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, () => {
        fetchRef.current?.();
      })
      .subscribe();

    const orderItemsSubscription = supabase
      .channel('order-items-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'order_items' 
      }, () => {
        fetchRef.current?.();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      orderItemsSubscription.unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));
      
      alert(`Order status updated to ${newStatus}!`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    }
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
    const user = order.users;
    const matchesSearch = 
      order.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportOrders = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }

    const csvContent = [
      'Order Number,Customer,Email,Status,Total,Date',
      ...filteredOrders.map(order => {
        const user = order.users;
        return `${order.tracking_number},"${user?.first_name || ''} ${user?.last_name || ''}",${user?.email || ''},${order.status},${order.total},${new Date(order.created_at).toLocaleDateString()}`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length
    };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-lg font-semibold text-gray-900 mb-2">Failed to load orders</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchOrders} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

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
          { title: 'Total Orders', value: stats.total, status: 'all', color: 'primary' },
          { title: 'Pending', value: stats.pending, status: 'pending', color: 'warning' },
          { title: 'Processing', value: stats.processing, status: 'processing', color: 'primary' },
          { title: 'Shipped', value: stats.shipped, status: 'shipped', color: 'blue' },
          { title: 'Delivered', value: stats.delivered, status: 'delivered', color: 'success' }
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
                        {order.tracking_number || `#${order.id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.users?.first_name || ''} {order.users?.last_name || ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.users?.email || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
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
                  <p className="text-gray-600">{selectedOrder.tracking_number || `#${selectedOrder.id}`}</p>
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
                      <p><strong>Name:</strong> {selectedOrder.users?.first_name || ''} {selectedOrder.users?.last_name || ''}</p>
                      <p><strong>Email:</strong> {selectedOrder.users?.email || 'No email'}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <MapPin size={18} className="mr-2" />
                      Shipping Address
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedOrder.shipping_address_line1 ? (
                        <div className="space-y-1">
                          <p>{selectedOrder.shipping_address_line1}</p>
                          {selectedOrder.shipping_address_line2 && <p>{selectedOrder.shipping_address_line2}</p>}
                          <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_postal_code}</p>
                          {selectedOrder.shipping_country && <p>{selectedOrder.shipping_country}</p>}
                        </div>
                      ) : (
                        <p className="text-gray-500">No address provided</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <CreditCard size={18} className="mr-2" />
                      Payment Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Method:</strong> {selectedOrder.payment_method}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </p>
                      {selectedOrder.tracking_number && (
                        <p><strong>Tracking:</strong> {selectedOrder.tracking_number}</p>
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
                      {selectedOrder.order_items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              className="w-10 h-10 object-cover rounded mr-3"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg';
                              }}
                            />
                            <div>
                              <p className="font-medium text-gray-900">{item.products.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">
                            Ksh {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      )) || <p className="text-gray-500">No items found</p>}
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
                          <p className="text-xs text-gray-500">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {selectedOrder.status !== 'pending' && (
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-success rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium">Status Updated</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.updated_at).toLocaleString()}</p>
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