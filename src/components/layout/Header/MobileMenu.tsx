import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, LayoutGrid } from "lucide-react";
import { headerCategories } from "../../../data/headerCategories";

interface MobileMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
}

const MobileMenu = ({ isOpen, closeMenu }: MobileMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="md:hidden bg-primary-dark"
      >
        <nav className="px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            className="block py-2 text-base text-white hover:text-accent-200"
            onClick={closeMenu}
          >
            Home
          </Link>
          <div className="py-2">
            <div className="flex items-center text-white mb-2 font-medium">
              <LayoutGrid size={18} className="mr-2" />
              Categories
            </div>
            <div className="pl-5 space-y-2">
              {headerCategories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/products/${category.slug}`}
                  className="block py-1.5 text-sm text-white hover:text-accent-200"
                  onClick={closeMenu}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          <Link
            to="/store-locator"
            className="block py-2 text-base text-white hover:text-accent-200"
            onClick={closeMenu}
          >
            Store Locator
          </Link>
          <Link
            to="/login"
            className="block py-2 text-base text-white hover:text-accent-200"
            onClick={closeMenu}
          >
            <LogIn size={18} className="inline mr-2" />
            Sign In / Register
          </Link>
        </nav>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MobileMenu;
