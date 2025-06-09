interface Slide {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

export const slides: Slide[] = [
  {
    id: 1,
    title: "Kitchen Collection",
    subtitle: "Discover the latest trends for the season",
    buttonText: "Shop Now",
    buttonLink: "/products/kitchen",
    image: "https://images.pexels.com/photos/30981356/pexels-photo-30981356/free-photo-of-modern-kitchenware-set-with-stainless-steel-pots.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: 2,
    title: "Beauty Essentials",
    subtitle: "Step up and glow",
    buttonText: "Shop Now",
    buttonLink: "/products/beauty",
    image: "https://images.pexels.com/photos/7256120/pexels-photo-7256120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: 3,
    title: "Home Makeover",
    subtitle: "Transform your space with our home collection",
    buttonText: "Shop Now",
    buttonLink: "/products/home",
    image: "https://images.pexels.com/photos/7601135/pexels-photo-7601135.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
];