import { Link } from 'react-router-dom';
import { ShoppingCart, User, Heart, LogOut } from 'lucide-react';
import Button from '../../ui/Button';
import { useAuth } from '../../../hooks/useAuth';

const ActionButtons = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
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
      <Link
        to="/cart"
        className="p-2 text-white hover:text-accent-200 relative"
        aria-label="Cart"
      >
        <ShoppingCart size={24} />
        <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          3
        </span>
      </Link>
      
      {user ? (
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-white">{user.first_name}</span>
          <button 
            onClick={handleLogout}
            className="text-white hover:text-accent-200 flex items-center space-x-1"
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