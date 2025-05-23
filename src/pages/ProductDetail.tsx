import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, ShoppingCart, Share2, Star, CheckCircle, 
  ChevronDown, ChevronUp, Truck, RotateCcw, Shield, 
  AlertTriangle 
} from 'lucide-react';
import { mockProducts } from '../data/mockProducts';
import Button from '../components/ui/Button';
import ProductCarousel from '../components/home/ProductCarousel';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState(mockProducts[0]);
  const [relatedProducts, setRelatedProducts] = useState(mockProducts.slice(1, 6));
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['description']);
  const [selectedTab, setSelectedTab] = useState('description');
  
  // Get product data
  useEffect(() => {
    // In a real app, this would be an API call
    if (id) {
      const foundProduct = mockProducts.find(p => p.id === parseInt(id)) || mockProducts[0];
      setProduct(foundProduct);
      setIsFavorite(foundProduct.isFavorite);
      
      // Find related products (same category)
      const related = mockProducts
        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
        .slice(0, 5);
      setRelatedProducts(related);
      
      // Update document title
      document.title = `${foundProduct.name} | ShopVista`;
      
      // Scroll to top
      window.scrollTo(0, 0);
    }
  }, [id]);
  
  const increaseQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, this would call an API to save to user's favorites
  };
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };
  
  const isExpanded = (section: string) => expandedSections.includes(section);

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-gray-500 hover:text-primary">Home</Link></li>
            <li><span className="text-gray-400 mx-1">/</span></li>
            <li><Link to={`/products/${product.category.toLowerCase()}`} className="text-gray-500 hover:text-primary">{product.category}</Link></li>
            <li><span className="text-gray-400 mx-1">/</span></li>
            <li className="text-gray-700 truncate max-w-xs">{product.name}</li>
          </ol>
        </nav>
        
        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-4">
              <div className="sticky top-24">
                <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                  <img
                    src={product.images?.[currentImage] || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-2 py-1 rounded">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-2 mt-2">
                    {product.images.map((image, index) => (
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
            
            {/* Product Info */}
            <div className="md:w-1/2 p-6 md:border-l border-gray-200">
              {/* Brand & Title */}
              <div className="mb-4">
                <Link to={`/products?brand=${product.brand}`} className="text-sm text-primary font-medium">
                  {product.brand}
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
              </div>
              
              {/* Ratings */}
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
              
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  {product.originalPrice > product.price && (
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.discount > 0 && (
                  <span className="text-sm text-accent-dark font-medium mt-1 inline-block">
                    You save ${(product.originalPrice - product.price).toFixed(2)} ({product.discount}%)
                  </span>
                )}
              </div>
              
              {/* Short Description */}
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              {/* Availability */}
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
              
              {/* Add to Cart */}
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
                  variant="primary"
                  size="lg"
                  icon={<ShoppingCart size={18} />}
                  className="flex-grow md:flex-grow-0"
                >
                  Add to Cart
                </Button>
                
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-md border ${
                    isFavorite 
                      ? 'border-accent text-accent' 
                      : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
                  aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={20} fill={isFavorite ? "#bb313e" : "none"} />
                </button>
                
                <button
                  className="p-3 rounded-md border border-gray-300 text-gray-500 hover:border-gray-400"
                  aria-label="Share product"
                >
                  <Share2 size={20} />
                </button>
              </div>
              
              {/* Shipping & Returns */}
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
          
          {/* Product Tabs */}
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
            
            {/* Tab Content */}
            <div>
              {/* Description */}
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
              
              {/* Specifications */}
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
                    { name: 'Country of Origin', value: 'United States' },
                  ].map((spec, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3">
                      <dt className="text-sm font-medium text-gray-500">{spec.name}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{spec.value}</dd>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reviews */}
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
                  
                  {/* Sample reviews */}
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
        
        {/* Related Products */}
        <div className="mt-12">
          <ProductCarousel 
            title="You might also like" 
            products={relatedProducts}
            viewAllLink={`/products/${product.category.toLowerCase()}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;