export interface Product {
  id: number;
  name: string;
  description: string;
  fullDescription?: string;
  price: number;
  originalPrice: number;
  discount: number; // percentage
  image: string;
  images?: string[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isFavorite: boolean;
  isNew: boolean;
  bestSeller: boolean;
}