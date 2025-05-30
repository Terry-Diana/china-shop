import { Lock } from "lucide-react";

export interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
  icon?: JSX.Element;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export const categoriesLinks: FooterLink[] = [
  { title: "Electronics", href: "/products/electronics" },
  { title: "Computers", href: "/products/computers" },
  { title: "Audio", href: "/products/audio" },
  { title: "Fashion", href: "/products/fashion" },
  { title: "Home", href: "/products/home" },
  { title: "All Categories", href: "/products" },
];

export const customerServiceLinks: FooterLink[] = [
  { title: "Contact Us", href: "/contact" },
  { title: "FAQ", href: "/faq" },
  { title: "Shipping & Delivery", href: "/shipping" },
  { title: "Returns & Exchanges", href: "/returns" },
  { title: "Terms & Conditions", href: "/terms" },
  { title: "Privacy Policy", href: "/privacy" },
];

export const aboutLinks: FooterLink[] = [
  {
    title: "About Us",
    href: "https://chinamall.co.ke/",
    external: true,
  },
  { title: "Careers", href: "/careers" },
  { title: "Store Locator", href: "/store-locator" },
  { title: "Blog", href: "/blog" },
  {
    title: "Admin Login",
    href: "/admin/login",
    icon: <Lock size={14} className="mr-1" />,
  },
];
