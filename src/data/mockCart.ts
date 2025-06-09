interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant: string;
}

export interface Cart {
  items: CartItem[];
  discount?: number;
  discountAmount?: number;
}

export const mockCart: Cart = {
  items: [
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      price: 7499.99,
      image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      quantity: 1,
      variant: "Black"
    },
    {
      id: 4,
      name: "Smart Fitness Watch",
      price: 6499.99,
      image: "https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      quantity: 1,
      variant: "Blue, Medium"
    },
    {
      id: 9,
      name: "Stainless Steel Water Bottle",
      price: 1249.99,
      image: "https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      quantity: 2,
      variant: "Green, 20oz"
    }
  ]
};