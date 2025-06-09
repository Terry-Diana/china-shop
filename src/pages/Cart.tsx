import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeFromCart, total, itemCount } = useCart();
  
  useEffect(() => {
    document.title = 'Your Cart | China Square';
    window.scrollTo(0, 0);

    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
    }
  }, [user, navigate]);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.16; // 16% VAT
  const shipping = subtotal > 5000 ? 0 : 500; // Free shipping over Ksh 5000
  const totalAmount = subtotal + tax + shipping;

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        {items.length > 0 ? (
          <div className="lg:flex lg:space-x-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <motion.div 
                className="bg-white rounded-lg shadow-sm overflow-hidden mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({items.length})
                    </h2>
                  </div>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <motion.li 
                      key={item.id} 
                      className="p-6 flex flex-col sm:flex-row"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Product Image */}
                      <div className="sm:w-20 sm:h-20 mb-4 sm:mb-0">
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="sm:ml-6 flex-grow">
                        <div className="flex flex-wrap justify-between mb-2">
                          <h3 className="text-base font-medium text-gray-900">
                            <Link to={`/product/${item.product.id}`} className="hover:text-primary">
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="font-semibold text-gray-900">
                            Ksh {(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity Display (Read-only) */}
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600">Quantity: </span>
                            <span className="ml-2 font-medium text-gray-900">{item.quantity}</span>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="text-gray-500 hover:text-error flex items-center transition-colors"
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
                  {/* Price Details */}
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">Ksh {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {shipping === 0 ? 'Free' : `Ksh ${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VAT (16%)</span>
                      <span className="text-gray-900">Ksh {tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">Ksh {totalAmount.toFixed(2)}</span>
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
                      <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">VISA</div>
                      <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">MC</div>
                      <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">MPESA</div>
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
                  Continue Shopping
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