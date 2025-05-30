import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
//import { AnimatePresence } from 'framer-motion';
import TopBar from './TopBar';
import MobileMenu from './MobileMenu';
import SearchBar from '../../ui/SearchBar';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary-600 shadow-md' : 'bg-primary'
      }`}
    >
      <div className="container mx-auto px-4">
        <TopBar 
          isMobileMenuOpen={isMobileMenuOpen} 
          toggleMobileMenu={toggleMobileMenu} 
        />

        {/* Mobile search - shows below header on mobile */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        closeMenu={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  );
};

export default Header;