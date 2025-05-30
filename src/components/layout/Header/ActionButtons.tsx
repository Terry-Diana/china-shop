import { Link } from "react-router-dom";
import { ShoppingCart, User, Heart } from "lucide-react";
import Button from "../../ui/Button";

const ActionButtons = () => (
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
    <Link
      to="/login"
      className="p-2 text-white hover:text-accent-200 hidden md:block"
      aria-label="Account"
    >
      <User size={24} />
    </Link>
    <Link to="/login" className="hidden md:block">
      <Button variant="accent" size="sm">
        Sign In
      </Button>
    </Link>
  </div>
);

export default ActionButtons;
