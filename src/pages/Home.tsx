import { useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import ProductCarousel from '../components/home/ProductCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import { mockProducts } from '../data/mockProducts';

const Home = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Update document title
    document.title = 'China Square | Better Choices, Better Prices';
  }, []);

  // Filter products by categories for different sections
  const newArrivals = mockProducts.filter(p => p.isNew).slice(0, 10);
  const bestSellers = mockProducts.filter(p => p.bestSeller).slice(0, 10);
  const deals = mockProducts.filter(p => p.discount > 0).slice(0, 10);

  return (
    <div>
      {/* Hero Section with Banner Slider */}
      <HeroSection />
      
      {/* Categories Grid */}
      <CategoryGrid />
      
      {/* New Arrivals Carousel */}
      <ProductCarousel 
        title="New Arrivals" 
        subtitle="Just in and trending now" 
        products={newArrivals}
        viewAllLink="/products?filter=new"
      />
      
      {/* Best Sellers Carousel */}
      <ProductCarousel 
        title="Best Sellers" 
        subtitle="Our most popular products" 
        products={bestSellers}
        viewAllLink="/products?filter=best-sellers"
      />
      
      {/* Special Offers Banner */}
      <div className="py-10 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg overflow-hidden shadow-lg">
            <div className="md:flex items-center">
              <div className="p-8 md:p-12 md:w-3/5">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Summer Sale Up To 50% Off
                </h2>
                <p className="text-white/80 mb-6 text-lg">
                  Take advantage of our biggest sale of the season on electronics, fashion, and home goods.
                </p>
                <a 
                  href="/products?filter=sale" 
                  className="inline-block bg-accent hover:bg-accent-dark text-white font-medium py-3 px-8 rounded transition-colors"
                >
                  Shop Now
                </a>
              </div>
              <div className="relative md:w-2/5 h-64 md:h-auto">
                <img 
                  src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Summer Sale" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deals & Discounts Carousel */}
      <ProductCarousel 
        title="Deals & Discounts" 
        subtitle="Save big on these special offers" 
        products={deals}
        viewAllLink="/products?filter=deals"
      />
      
      {/* Features Grid */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Shop With Us</h2>
            <p className="text-gray-600">We offer the best shopping experience with these benefits</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Free Shipping',
                description: 'On all orders over Ksh 5,000',
                icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRydWNrLWVsZWN0cmljLWljb24gbHVjaWRlLXRydWNrLWVsZWN0cmljIj48cGF0aCBkPSJNMTQgMTlWN2EyIDIgMCAwIDAtMi0ySDkiLz48cGF0aCBkPSJNMTUgMTlIOSIvPjxwYXRoIGQ9Ik0xOSAxOWgyYTEgMSAwIDAgMCAxLTF2LTMuNjVhMSAxIDAgMCAwLS4yMi0uNjJMMTguMyA5LjM4YTEgMSAwIDAgMC0uNzgtLjM4SDE0Ii8+PHBhdGggZD0iTTIgMTN2NWExIDEgMCAwIDAgMSAxaDIiLz48cGF0aCBkPSJNNCAzIDIuMTUgNS4xNWEuNDk1LjQ5NSAwIDAgMCAuMzUuODZoMi4xNWEuNDcuNDcgMCAwIDEgLjM1Ljg2TDMgOS4wMiIvPjxjaXJjbGUgY3g9IjE3IiBjeT0iMTkiIHI9IjIiLz48Y2lyY2xlIGN4PSI3IiBjeT0iMTkiIHI9IjIiLz48L3N2Zz4=',
              },
              {
                title: 'Easy Returns',
                description: '30 day return policy',
                icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVuZG8yLWljb24gbHVjaWRlLXVuZG8tMiI+PHBhdGggZD0iTTkgMTQgNCA5bDUtNSIvPjxwYXRoIGQ9Ik00IDloMTAuNWE1LjUgNS41IDAgMCAxIDUuNSA1LjVhNS41IDUuNSAwIDAgMS01LjUgNS41SDExIi8+PC9zdmc+',
              },
              {
                title: 'Secure Payments',
                description: 'Protected by encryption',
                icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWhhbmQtY29pbnMtaWNvbiBsdWNpZGUtaGFuZC1jb2lucyI+PHBhdGggZD0iTTExIDE1aDJhMiAyIDAgMSAwIDAtNGgtM2MtLjYgMC0xLjEuMi0xLjQuNkwzIDE3Ii8+PHBhdGggZD0ibTcgMjEgMS42LTEuNGMuMy0uNC44LS42IDEuNC0uNmg0YzEuMSAwIDIuMS0uNCAyLjgtMS4ybDQuNi00LjRhMiAyIDAgMCAwLTIuNzUtMi45MWwtNC4yIDMuOSIvPjxwYXRoIGQ9Im0yIDE2IDYgNiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iOSIgcj0iMi45Ii8+PGNpcmNsZSBjeD0iNiIgY3k9IjUiIHI9IjMiLz48L3N2Zz4=',
              },
              {
                title: '24/7 Support',
                description: 'Help when you need it',
                icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBob25lLWNhbGwtaWNvbiBsdWNpZGUtcGhvbmUtY2FsbCI+PHBhdGggZD0iTTEzIDJhOSA5IDAgMCAxIDkgOSIvPjxwYXRoIGQ9Ik0xMyA2YTUgNSAwIDAgMSA1IDUiLz48cGF0aCBkPSJNMTMuODMyIDE2LjU2OGExIDEgMCAwIDAgMS4yMTMtLjMwM2wuMzU1LS40NjVBMiAyIDAgMCAxIDE3IDE1aDNhMiAyIDAgMCAxIDIgMnYzYTIgMiAwIDAgMS0yIDJBMTggMTggMCAwIDEgMiA0YTIgMiAwIDAgMSAyLTJoM2EyIDIgMCAwIDEgMiAydjNhMiAyIDAgMCAxLS44IDEuNmwtLjQ2OC4zNTFhMSAxIDAgMCAwLS4yOTIgMS4yMzMgMTQgMTQgMCAwIDAgNi4zOTIgNi4zODQiLz48L3N2Zz4=',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="inline-block mb-4">
                  <img src={feature.icon} alt={feature.title} className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Newsletter Sign-up */}
      <div className="py-16 bg-primary-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Newsletter</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Subscribe to our newsletter and get 10% off your first purchase plus updates on new arrivals and special offers.
          </p>
          
          <form className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-l-md focus:outline-none"
              required
            />
            <button 
              type="submit" 
              className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded-r-md transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;