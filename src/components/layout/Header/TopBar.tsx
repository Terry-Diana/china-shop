import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../ui/Logo";
import SearchBar from "../../ui/SearchBar";
import DesktopNavigation from "./DesktopNavigation";
import ActionButtons from "./ActionButtons";

interface TopBarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const TopBar = ({ isMobileMenuOpen, toggleMobileMenu }: TopBarProps) => (
  <div className="flex items-center justify-between h-24">
    {/* Logo and mobile menu trigger */}
    <div className="flex items-center">
      <button
        className="mr-2 md:hidden"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Menu size={24} className="text-white" />
        )}
      </button>
      <Link to="/" aria-label="Home">
        <Logo />
      </Link>
    </div>

    {/* Desktop navigation */}
    <DesktopNavigation />

    {/* Search bar */}
    <div className="hidden md:block flex-grow max-w-xl mx-4">
      <SearchBar />
    </div>

    {/* Action buttons */}
    <ActionButtons />
  </div>
);

export default TopBar;
