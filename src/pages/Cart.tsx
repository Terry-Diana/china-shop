import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { mockCart } from '../data/mockCart';

const Cart = () => {
  const [cart, setCart] = useState(mockCart);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = 'Your Cart | ShopVista';
    window.scrollTo(0, 0);
  }, []);
  
  const updateQuantity = (id: number, newQty: number) => {
    if (newQty < 1 || newQty > 10) return;
    
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item => 
        item.id === id ? { ...item, quantity: newQty } : item
      )
    }));
  };
  
  const removeItem = (id: number) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(item => item.id !== id)
    }));
  };
  
  const applyCoupon = () => {
    if (!couponCode) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // Mock coupon application - in a real app this would be an API call
    if (couponCode.toUpperCase() === 'SAVE10') {
      setCart(prevCart => ({
        ...prevCart,
        discount: 10,
        discountAmount: calculateSubtotal() * 0.1
      }));
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setCouponApplied(false);
    }
  };
  
  const calculateSubtotal = () => {
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping - (cart.discountAmount || 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        {cart.items.length > 0 ? (
          <div className="lg:flex lg:space-x-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <motion.div 
                className="bg-white rounded-lg shadow-sm overflow-hidden mb-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({cart.items.length})
                    </h2>
                  </div>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <motion.li 
                      key={item.id} 
                      className="p-6 flex flex-col sm:flex-row"
                      variants={itemVariants}
                    >
                      {/* Product Image */}
                      <div className="sm:w-20 sm:h-20 mb-4 sm:mb-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="sm:ml-6 flex-grow">
                        <div className="flex flex-wrap justify-between mb-2">
                          <h3 className="text-base font-medium text-gray-900">
                            <Link to={`/product/${item.id}`} className="hover:text-primary">
                              {item.name}
                            </Link>
                          </h3>
                          <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-4">{item.variant}</p>
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-10 text-center border-none focus:ring-0"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity >= 10}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-500 hover:text-error flex items-center"
                          >
                            <Trash2 size={16} className="mr-1" />
                            <span className="text-sm">Remove</span>
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              {/* Continue Shopping */}
              <div className="flex justify-between items-center mb-8">
                <Link 
                  to="/products" 
                  className="text-primary hover:text-primary-dark inline-flex items-center"
                >
                  <ShoppingBag size={16} className="mr-2" />
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>
                
                <div className="p-6">
                  {/* Coupon Code */}
                  <div className="mb-6">
                    <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
                      Apply Coupon Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.trim())}
                        disabled={couponApplied}
                        placeholder="Enter coupon code"
                        className="flex-grow rounded-l-md border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponApplied}
                        className={`px-4 py-2 font-medium rounded-r-md ${
                          couponApplied
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-primary hover:bg-primary-dark text-white'
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="mt-1 text-sm text-error">{couponError}</p>}
                    {couponApplied && (
                      <p className="mt-1 text-sm text-success flex items-center">
                        Coupon applied successfully!
                      </p>
                    )}
                  </div>
                  
                  {/* Price Details */}
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    {cart.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount ({cart.discount}%)</span>
                        <span className="text-error">-${cart.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (8%)</span>
                      <span className="text-gray-900">${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Checkout Button */}
                  <Button
                    variant="accent"
                    size="lg"
                    fullWidth
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  {/* Payment Methods */}
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 mb-2">SECURE CHECKOUT</p>
                    <div className="flex justify-center space-x-2">
                      <img src="https://via.placeholder.com/40x25" alt="Visa" className="h-6" />
                      <img src="https://via.placeholder.com/40x25" alt="Mastercard" className="h-6" />
                      <img src="https://via.placeholder.com/40x25" alt="PayPal" className="h-6" />
                      <img src="https://via.placeholder.com/40x25" alt="M-Pesa" className="h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <ShoppingBag size={32} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Link to="/products">
                <Button variant="primary" size="lg">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;