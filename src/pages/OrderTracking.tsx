import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  CreditCard,
  ArrowLeft,
  Phone,
  Mail
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

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
  order_items: Array<{
    id: number;
    quantity: number;
    price: number;
    products: {
      name: string;
      image_url: string;
    };
  }>;
}

const OrderTracking = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = `Track Order ${orderNumber} | China Square`;
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    if (!orderNumber || !user) {
      setError('Invalid order number or user not logged in');
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            products (
              name,
              image_url
            )
          )
        `)
        .eq('tracking_number', orderNumber)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Order not found');
        } else {
          setError('Error fetching order details');
        }
        return;
      }

      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    const iconClass = `w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`;
    
    switch (status) {
      case 'pending':
        return <Clock className={iconClass} />;
      case 'processing':
        return <Package className={iconClass} />;
      case 'shipped':
        return <Truck className={iconClass} />;
      case 'delivered':
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-200';
    
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'processing':
        return 'bg-primary';
      case 'shipped':
        return 'bg-blue-600';
      case 'delivered':
        return 'bg-success';
      default:
        return 'bg-gray-400';
    }
  };

  const orderStatuses = [
    { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
    { key: 'processing', label: 'Processing', description: 'We are preparing your order' },
    { key: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
    { key: 'delivered', label: 'Delivered', description: 'Order has been delivered' }
  ];

  const getCurrentStatusIndex = (status: string) => {
    return orderStatuses.findIndex(s => s.key === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <Link to="/products">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/products" className="inline-flex items-center text-primary hover:text-primary-dark mb-4">
              <ArrowLeft size={20} className="mr-2" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600">Track your order status and delivery information</p>
          </div>

          {/* Order Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Order {order.tracking_number}</h2>
                <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  order.status === 'delivered' ? 'bg-success-50 text-success' :
                  order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                  order.status === 'processing' ? 'bg-primary-50 text-primary' :
                  'bg-warning-50 text-warning'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Order Status</h3>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between">
                  {orderStatuses.map((status, index) => {
                    const isActive = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    
                    return (
                      <motion.div
                        key={status.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col items-center"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          getStatusColor(status.key, isActive)
                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''} transition-all duration-300`}>
                          {getStatusIcon(status.key, isActive)}
                        </div>
                        <div className="mt-3 text-center">
                          <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {status.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 max-w-24">
                            {status.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.status !== 'delivered' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Estimated Delivery: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-blue-700">Standard delivery (2-3 business days)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{item.products.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900">
                        Ksh {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>Ksh {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{order.shipping === 0 ? 'Free' : `Ksh ${order.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>Ksh {order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span>Ksh {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Contact Info */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </h3>
                <div className="text-gray-600">
                  <p>{order.shipping_address_line1}</p>
                  {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                  <p>{order.shipping_city}, {order.shipping_state}</p>
                  <p>{order.shipping_postal_code}</p>
                  <p>{order.shipping_country}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h3>
                <p className="text-gray-600">{order.payment_method}</p>
              </div>

              {/* Contact Support */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-3" />
                    <span>+254 700 000 000</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-3" />
                    <span>support@chinasquare.com</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4" fullWidth>
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;