import { Facebook, Instagram, Youtube } from "lucide-react";

export interface SocialLink {
  name: string;
  href: string;
  icon: JSX.Element;
}

export const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/ChinaSquareKenya",
    icon: <Facebook size={18} />,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/kenya_china_square/",
    icon: <Instagram size={18} />,
  },
  {
    name: "YouTube",
    href: "https://www.tiktok.com/@kenya_chinasquare",
    icon: <Youtube size={18} />,
  },
];
