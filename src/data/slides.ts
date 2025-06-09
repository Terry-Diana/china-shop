import homemakeover from "../media/img/homemakeover.jpg";
import beautyessentials from "../media/img/beautyessentials.jpg";
import kitchenessentials from "../media/img/kitchenessentials.jpg"

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image?: string;
}

export const slides: Slide[] = [
  {
    id: 1,
    title: "Kitchen Collection",
    subtitle: "Discover the latest trends for the season",
    buttonText: "Shop Now",
    buttonLink: "/products/fashion",
    image: kitchenessentials,
  },
  {
    id: 2,
    title: "Beauty Essentials",
    subtitle: "Step up and glow",
    buttonText: "Shop Now",
    buttonLink: "/products/electronics",
    image: beautyessentials,
  },
  {
    id: 3,
    title: "Home Makeover",
    subtitle: "Transform your space with our home collection",
    buttonText: "Shop Now",
    buttonLink: "/products/home",
    image: homemakeover,
  },
];