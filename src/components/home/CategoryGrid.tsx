import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Headphones,
  CookingPot,
  Flower2,
  Blocks,
  ShoppingBag,
  Bath,
  PaintBucket,
  Dumbbell,
  Lamp,
  NotebookPen,
  Fan,
  PartyPopper,
  PawPrint,
  Baby,
  Sofa,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: JSX.Element;
  image: string;
  link: string;
}

const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: <Headphones size={24} />,
    image:
      "https://images.pexels.com/photos/20013901/pexels-photo-20013901/free-photo-of-headphones-on-a-stand.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/electronics",
  },
  {
    id: "furniture",
    name: "Furniture",
    icon: <Sofa size={24} />,
    image:
      "https://images.pexels.com/photos/7601135/pexels-photo-7601135.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/home",
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: <CookingPot size={24} />,
    image:
      "https://images.pexels.com/photos/18071814/pexels-photo-18071814/free-photo-of-tea-and-coffeemaker.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/kitchen",
  },
  {
    id: "beauty",
    name: "Beauty",
    icon: <Flower2 size={24} />,
    image:
      "https://images.pexels.com/photos/7256120/pexels-photo-7256120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/beauty",
  },
  {
    id: "toys",
    name: "Toys",
    icon: <Blocks size={24} />,
    image:
      "https://images.pexels.com/photos/7298152/pexels-photo-7298152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/toys",
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: <ShoppingBag size={24} />,
    image:
      "https://images.pexels.com/photos/11031129/pexels-photo-11031129.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/fashion",
  },
  {
    id: "bathroom",
    name: "Bathroom",
    icon: <Bath size={24} />,
    image:
      "https://images.pexels.com/photos/8082553/pexels-photo-8082553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/bathroom",
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: <PaintBucket size={24} />,
    image:
      "https://plus.unsplash.com/premium_photo-1675937428935-4805321bb51e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/products/cleaning",
  },
  {
    id: "fitness",
    name: "Fitness",
    icon: <Dumbbell size={24} />,
    image:
      "https://images.pexels.com/photos/4397833/pexels-photo-4397833.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/fitness",
  },
  {
    id: "decor",
    name: "Decor",
    icon: <Fan size={24} />,
    image:
      "https://images.pexels.com/photos/3718469/pexels-photo-3718469.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/decor",
  },
  {
    id: "stationery",
    name: "Stationery",
    icon: <NotebookPen size={24} />,
    image:
      "https://images.unsplash.com/photo-1632132142911-4695eae11663?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/products/stationery",
  },
  {
    id: "lights",
    name: "Lights",
    icon: <Lamp size={24} />,
    image:
      "https://cdn.pixabay.com/photo/2016/08/18/20/05/light-bulbs-1603766_960_720.jpg",
    link: "/products/lights",
  },
  {
    id: "party",
    name: "Party Supplies",
    icon: <PartyPopper size={24} />,
    image:
      "https://images.pexels.com/photos/20433310/pexels-photo-20433310/free-photo-of-balloons-and-decorations-for-the-second-birthday.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/party",
  },
  {
    id: "baby",
    name: "Baby",
    icon: <Baby size={24} />,
    image:
      "https://images.pexels.com/photos/15376336/pexels-photo-15376336/free-photo-of-socks-on-the-basket.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    link: "/products/baby",
  },
  {
    id: "pets",
    name: "Pet Supplies",
    icon: <PawPrint size={24} />,
    image:
      "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?q=80&w=1325&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/products/pets",
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Browse our most popular categories and find exactly what you're
            looking for.
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
            <motion.div key={category.id} variants={itemVariants}>
              <Link
                to={category.link}
                className="block group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="aspect-square bg-cover bg-center"
                  style={{ backgroundImage: `url(${category.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-transparent">
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