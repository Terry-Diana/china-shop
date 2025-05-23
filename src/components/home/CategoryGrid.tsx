import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Headphones, ShoppingBag, Home as HomeIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: JSX.Element;
  image: string;
  link: string;
}

const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: <Smartphone size={24} />,
    image: 'https://images.pexels.com/photos/1786433/pexels-photo-1786433.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    link: '/products/electronics',
  },
  {
    id: 'computers',
    name: 'Computers',
    icon: <Laptop size={24} />,
    image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    link: '/products/computers',
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: <Headphones size={24} />,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    link: '/products/audio',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: <ShoppingBag size={24} />,
    image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    link: '/products/fashion',
  },
  {
    id: 'home',
    name: 'Home',
    icon: <HomeIcon size={24} />,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    link: '/products/home',
  },
];

const CategoryGrid = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Browse our most popular categories and find exactly what you're looking for.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category) => (
            <motion.div 
              key={category.id}
              variants={itemVariants}
            >
              <Link 
                to={category.link}
                className="block group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div 
                  className="aspect-square bg-cover bg-center"
                  style={{ backgroundImage: `url(${category.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/80 transition-colors">
                        {category.icon}
                      </div>
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryGrid;