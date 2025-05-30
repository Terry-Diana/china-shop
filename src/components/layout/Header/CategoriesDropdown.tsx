import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { HeaderCategory } from "../../../data/headerCategories";

interface CategoriesDropdownProps {
  isOpen: boolean;
  categories: HeaderCategory[];
}

const CategoriesDropdown = ({
  isOpen,
  categories,
}: CategoriesDropdownProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="absolute left-0 mt-1 w-60 rounded-md shadow-lg bg-white z-50"
      >
        <div className="py-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/products/${category.slug}`}
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
  </AnimatePresence>
);

export default CategoriesDropdown;
