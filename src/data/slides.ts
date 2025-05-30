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
    buttonLink: "/products/fashion",
    image: "https://images.pexels.com/photos/30981356/pexels-photo-30981356/free-photo-of-modern-kitchenware-set-with-stainless-steel-pots.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: 2,
    title: "Tech Essentials",
    subtitle: "Upgrade your gadgets with the newest releases",
    buttonText: "Shop Now",
    buttonLink: "/products/electronics",
    image: "https://images.pexels.com/photos/27436633/pexels-photo-27436633/free-photo-of-a-desk-with-a-computer-and-a-keyboard-on-it.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: 3,
    title: "Home Makeover",
    subtitle: "Transform your space with our home collection",
    buttonText: "Shop Now",
    buttonLink: "/products/home",
    image: "https://cdn.pixabay.com/photo/2016/08/26/15/06/home-1622401_960_720.jpg",
  },
];