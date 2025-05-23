import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, User, Heart, Menu, X, 
  ChevronDown, LogIn, LayoutGrid, 
  Smartphone, ShoppingBag, 
  Sofa,
  CookingPot,
  Flower2,
  Blocks,
  Bath,
  PaintBucket,
  Dumbbell,
  Fan,
  NotebookPen,
  Lamp,
  PartyPopper,
  Baby,
  PawPrint
} from 'lucide-react';
import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';
import Logo from '../ui/Logo';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const categories = [
    { name: 'Electronics', icon: <Smartphone size={18} /> },
    { name: 'Furniture', icon: <Sofa size={18} /> },
    { name: 'Kitchen', icon: <CookingPot size={18} /> },
    { name: 'Beauty', icon: <Flower2 size={18} /> },
    { name: 'Toys', icon: <Blocks size={18} /> },
    { name: 'Fashion', icon: <ShoppingBag size={18} /> },
    { name: 'Bathroom', icon: <Bath size={18} /> },
    { name: 'Cleaning', icon: <PaintBucket size={18} /> },
    { name: 'Fitness', icon: <Dumbbell size={18} /> },
    { name: 'Decor', icon: <Fan size={18} /> },
    { name: 'Stationery', icon: <NotebookPen size={18} /> },
    { name: 'Lights', icon: <Lamp size={18} /> },
    { name: 'Party Supplies', icon: <PartyPopper size={18} /> },
    { name: 'Baby', icon: <Baby size={18} /> },
    { name: 'Pet Supplies', icon: <PawPrint size={18} /> },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary-600 shadow-md' : 'bg-primary'
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Top navigation bar */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo and mobile menu trigger */}
          <div className="flex items-center">
            <button 
              className="mr-2 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
            </button>
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-3 py-2 text-white hover:text-accent-200 font-medium">
              Home
            </Link>
            <div className="relative">
              <button 
                className="px-3 py-2 text-white hover:text-accent-200 font-medium flex items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 100)}
              >
                Categories <ChevronDown size={16} className="ml-1" />
              </button>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 mt-1 w-60 rounded-md shadow-lg bg-white z-50"
                >
                  <div className="py-2">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        to={`/products/${category.name.toLowerCase()}`}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span className="mr-3 text-primary">{category.icon}</span>
                        {category.name}
                      </Link>
                    ))}
                    <Link
                      to="/products"
                      className="flex items-center px-4 py-3 text-sm font-medium text-primary-600 hover:bg-gray-100 border-t"
                    >
                      <LayoutGrid size={18} className="mr-3" />
                      View All Categories
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
            <Link to="/store-locator" className="px-3 py-2 text-white hover:text-accent-200 font-medium">
              Store Locator
            </Link>
          </nav>

          {/* Search bar */}
          <div className="hidden md:block flex-grow max-w-xl mx-4">
            <SearchBar />
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <Link to="/wishlist" className="p-2 text-white hover:text-accent-200">
              <Heart size={24} />
            </Link>
            <Link to="/cart" className="p-2 text-white hover:text-accent-200 relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">3</span>
            </Link>
            <Link to="/login" className="p-2 text-white hover:text-accent-200 hidden md:block">
              <User size={24} />
            </Link>
            <Link to="/login" className="hidden md:block">
              <Button variant="accent" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile search - shows below header on mobile */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-primary-dark"
        >
          <nav className="px-4 pt-2 pb-4 space-y-2">
            <Link to="/" className="block py-2 text-base text-white hover:text-accent-200">
              Home
            </Link>
            <div className="py-2">
              <div className="flex items-center text-white mb-2 font-medium">
                <LayoutGrid size={18} className="mr-2" />
                Categories
              </div>
              <div className="pl-5 space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={`/products/${category.name.toLowerCase()}`}
                    className="block py-1.5 text-sm text-white hover:text-accent-200"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/store-locator" className="block py-2 text-base text-white hover:text-accent-200">
              Store Locator
            </Link>
            <Link to="/login" className="block py-2 text-base text-white hover:text-accent-200">
              <LogIn size={18} className="inline mr-2" />
              Sign In / Register
            </Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;