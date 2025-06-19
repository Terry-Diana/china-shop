import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Share2, Star, CheckCircle, ChevronDown, ChevronUp, Truck, RotateCcw, Shield, AlertTriangle, BarChart3 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import Button from '../components/ui/Button';
import ProductCarousel from '../components/home/ProductCarousel';
import TouchOptimizedCarousel from '../components/ui/TouchOptimizedCarousel';
import RecentlyViewed from '../components/ui/RecentlyViewed';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useProductComparison } from '../hooks/useProductComparison';
import { useAnalytics } from '../hooks/useAnalytics';
import { Product } from '../types/product'; // Import the Product type

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addToComparison, isInComparison, canAddMore } = useProductComparison();
  const { trackProductView, trackAddToCart, trackAddToWishlist } = useAnalytics();
  
  // Fix: Add proper type annotations
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [buttonState, setButtonState] = useState<'default' | 'adding' | 'added'>('default');
  const [favoriteState, setFavoriteState] = useState<'default' | 'adding'>('default');
  
  // Use ref to track previous product ID
  const prevProductIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (id && products.length > 0) {
      const productId = parseInt(id);
      const foundProduct = products.find(p => p.id === productId);
      
      if (foundProduct && (!prevProductIdRef.current || prevProductIdRef.current !== productId)) {
        setProduct(foundProduct);
        addToRecentlyViewed(foundProduct);
        trackProductView(foundProduct.id, foundProduct.name);
        
        const related = products
          .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
          .slice(0, 5);
        setRelatedProducts(related);
        
        document.title = `${foundProduct.name} | China Square`;
        window.scrollTo(0, 0);
        
        // Update ref with current product ID
        prevProductIdRef.current = productId;
      }
    }
  }, [id, products, addToRecentlyViewed, trackProductView]);
  
  const increaseQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  
  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (favoriteState === 'adding' || !product) return;

    setFavoriteState('adding');

    try {
      if (isFavorite(product.id)) {
        await removeFromFavorites(product.id);
      } else {
        await addToFavorites(product.id);
        trackAddToWishlist(product.id, product.name);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    } finally {
      setFavoriteState('default');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (!product || product.stock === 0 || buttonState !== 'default') {
      return;
    }

    setButtonState('adding');

    try {
      await addToCart(product.id, quantity);
      trackAddToCart(product.id, product.name, quantity, product.price);
      
      // Show "Added to Cart" state
      setButtonState('added');
      
      // Reset to default after 3 seconds
      setTimeout(() => {
        setButtonState('default');
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setButtonState('default');
    }
  };

  const handleAddToComparison = () => {
    if (product && canAddMore && !isInComparison(product.id)) {
      addToComparison(product);
    }
  };

  const getCartButtonText = () => {
    if (!product) return 'Loading...';
    if (product.stock === 0) return 'Out of Stock';
    if (buttonState === 'adding') return 'Adding to Cart...';
    if (buttonState === 'added') return 'Added to Cart';
    return 'Add to Cart';
  };

  const getCartButtonClass = () => {
    if (!product || product.stock === 0) return 'bg-gray-400 cursor-not-allowed';
    if (buttonState === 'added') return 'bg-success hover:bg-success-dark';
    if (buttonState === 'adding') return 'bg-primary opacity-75 cursor-wait';
    return 'bg-primary hover:bg-primary-dark';
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const images = product.images || [product.image];

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-gray-500 hover:text-primary">Home</Link></li>
            <li><span className="text-gray-400 mx-1">/</span></li>
            <li><Link to={`/products/${product.category.toLowerCase()}`} className="text-gray-500 hover:text-primary">{product.category}</Link></li>
            <li><span className="text-gray-400 mx-1">/</span></li>
            <li className="text-gray-700 truncate max-w-xs">{product.name}</li>
          </ol>
        </nav>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-4">
              <div className="sticky top-24">
                {/* Mobile/Touch optimized carousel */}
                <div className="md:hidden">
                  <TouchOptimizedCarousel showArrows={false} showDots={true}>
                    {images.map((image, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={image}
                          alt={`${product.name} - view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </TouchOptimizedCarousel>
                </div>

                {/* Desktop image gallery */}
                <div className="hidden md:block">
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                    <img
                      src={images[currentImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-2 py-1 rounded">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  
                  {images.length > 1 && (
                    <div className="flex space-x-2 mt-2">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImage(index)}
                          className={`w-20 h-20 border-2 rounded overflow-hidden ${
                            currentImage === index ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} - view ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 p-6 md:border-l border-gray-200">
              <div className="mb-4">
                <Link to={`/products?brand=${product.brand}`} className="text-sm text-primary font-medium">
                  {product.brand}
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < product.rating ? "currentColor" : "none"}
                      stroke={i < product.rating ? "none" : "currentColor"}
                      className={i < product.rating ? "" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">Ksh {product.price.toFixed(2)}</span>
                  {product.originalPrice > product.price && (
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      Ksh {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.discount > 0 && (
                  <span className="text-sm text-accent-dark font-medium mt-1 inline-block">
                    You save Ksh {(product.originalPrice - product.price).toFixed(2)} ({product.discount}%)
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              <div className="flex items-center text-sm mb-6">
                {product.stock > 0 ? (
                  <>
                    <CheckCircle size={16} className="text-success mr-2" />
                    <span className="text-success font-medium">In Stock</span>
                    <span className="text-gray-600 ml-1">
                      ({product.stock > 10 ? 'More than 10' : `Only ${product.stock}`} left)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-error mr-2" />
                    <span className="text-error font-medium">Out of Stock</span>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={decreaseQuantity}
                    className="px-3 py-2 border-r border-gray-300 text-gray-600 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <ChevronDown size={18} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-12 text-center border-none focus:ring-0"
                  />
                  <button
                    onClick={increaseQuantity}
                    className="px-3 py-2 border-l border-gray-300 text-gray-600 hover:bg-gray-100"
                    disabled={quantity >= 10}
                  >
                    <ChevronUp size={18} />
                  </button>
                </div>
                
                <Button
                  variant={buttonState === 'added' ? 'accent' : 'primary'}
                  size="lg"
                  icon={<ShoppingCart size={18} />}
                  className="flex-grow md:flex-grow-0"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || buttonState !== 'default'}
                >
                  {getCartButtonText()}
                </Button>
                
                <button
                  onClick={toggleFavorite}
                  disabled={favoriteState === 'adding'}
                  className={`p-3 rounded-md border transition-all duration-200 ${
                    favoriteState === 'adding' ? 'opacity-75 cursor-wait' : ''
                  } ${
                    isFavorite(product.id) 
                      ? 'border-accent text-accent' 
                      : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
                  aria-label={isFavorite(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={20} fill={isFavorite(product.id) ? "#bb313e" : "none"} />
                </button>

                {canAddMore && !isInComparison(product.id) && (
                  <button
                    onClick={handleAddToComparison}
                    className="p-3 rounded-md border border-gray-300 text-gray-500 hover:border-gray-400 transition-colors"
                    aria-label="Add to comparison"
                  >
                    <BarChart3 size={20} />
                  </button>
                )}
                
                <button
                  className="p-3 rounded-md border border-gray-300 text-gray-500 hover:border-gray-400"
                  aria-label="Share product"
                >
                  <Share2 size={20} />
                </button>
              </div>
              
              <div className="space-y-4 mb-8 text-sm">
                <div className="flex">
                  <Truck size={18} className="text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-gray-600">2-3 business days</p>
                  </div>
                </div>
                <div className="flex">
                  <RotateCcw size={18} className="text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Easy Returns</p>
                    <p className="text-gray-600">30 day return policy</p>
                  </div>
                </div>
                <div className="flex">
                  <Shield size={18} className="text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Shopping</p>
                    <p className="text-gray-600">Your data is protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-6 py-8">
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 mx-2 first:ml-0 text-sm font-medium border-b-2 whitespace-nowrap ${
                    selectedTab === tab
                      ? 'text-primary border-primary'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            <div>
              {selectedTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="mb-4">
                    {product.fullDescription || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae eros quis orci volutpat venenatis. Nulla facilisi. Sed volutpat, sapien at efficitur placerat, nisi magna lacinia velit, eu pulvinar magna tortor non tellus."}
                  </p>
                  <p>
                    Aenean hendrerit dapibus velit, eu posuere dolor lobortis at. Nulla facilisi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque mattis est sit amet magna varius, eget tristique ligula pretium.
                  </p>
                </div>
              )}
              
              {selectedTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Brand', value: product.brand },
                    { name: 'Model', value: 'XYZ-123' },
                    { name: 'Color', value: 'Multiple options' },
                    { name: 'Material', value: 'Premium quality' },
                    { name: 'Dimensions', value: '10 x 5 x 3 inches' },
                    { name: 'Weight', value: '1.2 lbs' },
                    { name: 'Warranty', value: '1 year' },
                    { name: 'Country of Origin', value: 'Kenya' },
                  ].map((spec, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3">
                      <dt className="text-sm font-medium text-gray-500">{spec.name}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{spec.value}</dd>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedTab === 'reviews' && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <p className="text-5xl font-bold text-gray-900">{product.rating.toFixed(1)}</p>
                      <div className="flex text-yellow-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            fill={i < product.rating ? "currentColor" : "none"}
                            stroke={i < product.rating ? "none" : "currentColor"}
                            className={i < product.rating ? "" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{product.reviewCount} reviews</p>
                    </div>
                    
                    <div className="flex-grow">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const percentage = (star / 5) * 100;
                        return (
                          <div key={star} className="flex items-center">
                            <span className="text-sm text-gray-600 w-10">{star} stars</span>
                            <div className="flex-grow h-2 mx-2 bg-gray-200 rounded">
                              <div
                                className="h-2 bg-yellow-400 rounded"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-10">{Math.round(percentage)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <Button variant="primary">Write a Review</Button>
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      {
                        name: 'Sarah Johnson',
                        rating: 5,
                        date: '2 months ago',
                        comment: 'This product exceeded my expectations! The quality is excellent and it works exactly as described. I would definitely purchase again.',
                      },
                      {
                        name: 'Mike Thompson',
                        rating: 4,
                        date: '3 months ago',
                        comment: 'Great product for the price. Shipped quickly and works well. Would recommend to others looking for a reliable option.',
                      },
                    ].map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < review.rating ? "currentColor" : "none"}
                                stroke={i < review.rating ? "none" : "currentColor"}
                                className={i < review.rating ? "" : "text-gray-300"}
                              />
                            ))}
                          </div>
                          <p className="font-medium text-gray-900">{review.name}</p>
                          <span className="mx-2 text-gray-300">•</span>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <ProductCarousel 
            title="You might also like" 
            products={relatedProducts}
            viewAllLink={`/products/${product.category.toLowerCase()}`}
          />
        </div>

        <RecentlyViewed />
      </div>
    </div>
  );
};

export default ProductDetail;