export interface Product {
  id: number;
  name: string;
  description: string;
  fullDescription?: string; // Made optional
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  images?: string[]; // Made optional
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isFavorite?: boolean; // Made optional
  isNew: boolean;
  bestSeller: boolean;
}