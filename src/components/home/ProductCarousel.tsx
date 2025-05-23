import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import { Product } from '../../types/product';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductCarousel = ({ 
  title, 
  subtitle, 
  products,
  viewAllLink
}: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth * 0.8;
      
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          
          {viewAllLink && (
            <a 
              href={viewAllLink} 
              className="text-primary-600 hover:text-primary font-medium mt-2 sm:mt-0 text-sm"
            >
              View All &rarr;
            </a>
          )}
        </div>
        
        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="hidden md:block">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full shadow-md p-2 text-gray-800 hover:text-primary transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full shadow-md p-2 text-gray-800 hover:text-primary transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Products */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide -mx-2 py-2 px-2 sm:px-0 scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="px-2 min-w-[200px] w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;