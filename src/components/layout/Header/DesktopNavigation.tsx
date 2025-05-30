import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import CategoriesDropdown from "./CategoriesDropdown";
import { headerCategories } from "../../../data/headerCategories";

const DesktopNavigation = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isDropdownOpen &&
        !(e.target as HTMLElement).closest(".dropdown-container")
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <nav className="hidden md:flex items-center space-x-1">
      <Link
        to="/"
        className="px-3 py-2 text-white hover:text-accent-200 font-medium"
      >
        Home
      </Link>
      <div className="relative dropdown-container">
        <button
          className="px-3 py-2 text-white hover:text-accent-200 font-medium flex items-center"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          Categories <ChevronDown size={16} className="ml-1" />
        </button>
        <CategoriesDropdown
          isOpen={isDropdownOpen}
          categories={headerCategories}
        />
      </div>
      <Link
        to="/store-locator"
        className="px-3 py-2 text-white hover:text-accent-200 font-medium"
      >
        Store Locator
      </Link>
    </nav>
  );
};

export default DesktopNavigation;
