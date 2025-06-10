import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, MapPin, ChevronRight, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total: cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    document.title = 'Checkout | China Square';
    window.scrollTo(0, 0);

    // Redirect if not logged in or cart is empty
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, items, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateOrderTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.16; // 16% VAT
    const shipping = subtotal > 5000 ? 0 : 500; // Free shipping over Ksh 5000
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total };
  };

  const { subtotal, tax, shipping, total } = calculateOrderTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Place the order
    setIsSubmitting(true);
    
    try {
      // Create order in database
      const orderData = {
        user_id: user.id,
        status: 'pending',
        subtotal,
        tax,
        shipping,
        total,
        shipping_address_line1: formData.address,
        shipping_address_line2: formData.apartment,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_postal_code: formData.zipCode,
        shipping_country: 'Kenya',
        payment_method: 'Card',
        notes: `Customer: ${formData.firstName} ${formData.lastName}, Phone: ${formData.phone}`
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Generate order number
      const orderNum = `ORD-${new Date().getFullYear()}-${order.id.toString().padStart(6, '0')}`;
      
      // Update order with order number
      await supabase
        .from('orders')
        .update({ tracking_number: orderNum })
        .eq('id', order.id);

      // Clear cart
      await clearCart();

      // Show success
      setOrderNumber(orderNum);
      setOrderPlaced(true);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order confirmation screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-lg font-bold text-primary">{orderNumber}</p>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(`/orders/${orderNumber}`)}
            >
              Track Your Order
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['Shipping', 'Payment', 'Review'].map((label, index) => (
                <div key={label} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step > index + 1 ? 'bg-success text-white' :
                    step === index + 1 ? 'bg-primary text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {step > index + 1 ? '✓' : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${
                    step === index + 1 ? 'text-primary font-medium' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                  {index < 2 && (
                    <div className="mx-4 h-px w-12 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">
                          Ksh {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Shipping Information Summary */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <MapPin size={18} className="text-gray-600 mr-2" />
                    <h3 className="font-medium">Shipping Address</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address} {formData.apartment}<br />
                      {formData.city}, {formData.state} {formData.zipCode}<br />
                      {formData.phone}
                    </p>
                  </div>
                </div>
                
                {/* Payment Information Summary */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <CreditCard size={18} className="text-gray-600 mr-2" />
                    <h3 className="font-medium">Payment Method</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600">
                      Card ending in {formData.cardNumber.slice(-4)}<br />
                      {formData.cardName}
                    </p>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>Ksh {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `Ksh ${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VAT (16%)</span>
                      <span>Ksh {tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-base pt-2 border-t">
                      <span>Total</span>
                      <span>Ksh {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              <Button
                variant="accent"
                type="submit"
                className="ml-auto"
                icon={<ChevronRight size={18} />}
                iconPosition="right"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : (step === 3 ? 'Place Order' : 'Continue')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;