import { Link } from 'react-router-dom';
import { ShoppingCart, User, Heart, LogOut, Package } from 'lucide-react';
import Button from '../../ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../contexts/CartContext';

const ActionButtons = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      // Force reload even if logout fails
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Link
        to="/wishlist"
        className="p-2 text-white hover:text-accent-200"
        aria-label="Wishlist"
      >
        <Heart size={24} />
      </Link>
      
      {/* Only show cart when user is logged in */}
      {user && (
        <Link
          to="/cart"
          className="p-2 text-white hover:text-accent-200 relative"
          aria-label="Cart"
        >
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full font-medium">
              {itemCount}
            </span>
          )}
        </Link>
      )}
      
      {user ? (
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-white">Hi, {user.first_name || 'User'}</span>
          <button 
            onClick={handleLogout}
            className="text-white hover:text-accent-200 flex items-center space-x-1 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      ) : (
        <Link to="/login" className="hidden md:block">
          <Button variant="accent" size="sm">
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
};

export default ActionButtons;