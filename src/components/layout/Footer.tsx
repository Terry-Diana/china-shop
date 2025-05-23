import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  CreditCard,
  Shield,
  Clock,
  MapPin,
} from "lucide-react";
import Logo from "../ui/Logo";

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white">
      {/* Features bar */}
      <div className="border-b border-primary-400/20">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="text-accent" size={24} />
              <div>
                <h4 className="font-medium">Secure Payment</h4>
                <p className="text-xs text-gray-300">
                  Multiple payment options
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="text-accent" size={24} />
              <div>
                <h4 className="font-medium">Buyer Protection</h4>
                <p className="text-xs text-gray-300">Money back guarantee</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="text-accent" size={24} />
              <div>
                <h4 className="font-medium">Fast Delivery</h4>
                <p className="text-xs text-gray-300">
                  Express shipping options
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="text-accent" size={24} />
              <div>
                <h4 className="font-medium">Store Pickup</h4>
                <p className="text-xs text-gray-300">At your convenience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company & Newsletter */}
          <div>
            <Logo className="h-8 w-auto mb-4" />
            <p className="text-sm text-gray-300 mb-4">
              China Square offers a seamless shopping experience with quality
              products and exceptional service.
            </p>
            <h4 className="font-semibold mb-3">Subscribe to our newsletter</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="px-3 py-2 text-sm flex-grow bg-primary-light text-white rounded-l-md focus:outline-none"
                aria-label="Email address"
              />
              <button className="bg-accent hover:bg-accent-dark px-4 py-2 rounded-r-md transition-colors">
                <Mail size={18} />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products/electronics"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products/computers"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Computers
                </Link>
              </li>
              <li>
                <Link
                  to="/products/audio"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Audio
                </Link>
              </li>
              <li>
                <Link
                  to="/products/fashion"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  to="/products/home"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">About China Square</h4>
            <ul className="space-y-2">
              <a
                href="https://chinamall.co.ke/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-300 hover:text-accent-200 text-sm"
              >
                About Us
              </a>
              <li>
                <Link
                  to="/careers"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/store-locator"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Store Locator
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-gray-300 hover:text-accent-200 text-sm"
                >
                  Blog
                </Link>
              </li>
            </ul>
            <h4 className="font-semibold mt-6 mb-3">Follow Us</h4>
            <div className="flex space-x-3">
              <a
                href="https://www.facebook.com/ChinaSquareKenya"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="bg-primary-light hover:bg-accent transition-colors p-2 rounded-full"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/kenya_china_square/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="bg-primary-light hover:bg-accent transition-colors p-2 rounded-full"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@kenya_chinasquare"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="bg-primary-light hover:bg-accent transition-colors p-2 rounded-full"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-primary-900 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-3 md:mb-0">
            &copy; {new Date().getFullYear()} China Square. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;