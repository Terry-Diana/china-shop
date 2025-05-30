import {

Smartphone, ShoppingBag, Sofa, CookingPot, Flower2, Blocks,

Bath, PaintBucket, Dumbbell, Fan, NotebookPen, Lamp,

PartyPopper, Baby, PawPrint

} from 'lucide-react';

export interface HeaderCategory {

name: string;

slug: string;

icon: JSX.Element;

}

export const headerCategories: HeaderCategory[] = [

{ name: 'Electronics', slug: 'electronics', icon: <Smartphone size={18} /> },

{ name: 'Furniture', slug: 'furniture', icon: <Sofa size={18} /> },

{ name: 'Kitchen', slug: 'kitchen', icon: <CookingPot size={18} /> },

{ name: 'Beauty', slug: 'beauty', icon: <Flower2 size={18} /> },

{ name: 'Toys', slug: 'toys', icon: <Blocks size={18} /> },

{ name: 'Fashion', slug: 'fashion', icon: <ShoppingBag size={18} /> },

{ name: 'Bathroom', slug: 'bathroom', icon: <Bath size={18} /> },

{ name: 'Cleaning', slug: 'cleaning', icon: <PaintBucket size={18} /> },

{ name: 'Fitness', slug: 'fitness', icon: <Dumbbell size={18} /> },

{ name: 'Decor', slug: 'decor', icon: <Fan size={18} /> },

{ name: 'Stationery', slug: 'stationery', icon: <NotebookPen size={18} /> },

{ name: 'Lights', slug: 'lights', icon: <Lamp size={18} /> },

{ name: 'Party Supplies', slug: 'party', icon: <PartyPopper size={18} /> },

{ name: 'Baby', slug: 'baby', icon: <Baby size={18} /> },

{ name: 'Pet Supplies', slug: 'pets', icon: <PawPrint size={18} /> },

];