import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

const slides: Slide[] = [
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

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  
  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full overflow-hidden aspect-[16/9] md:aspect-[21/9] lg:aspect-[25/9]">
      {/* Slide container */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={slides[currentSlide].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url(${slides[currentSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-24">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-xl"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent mb-3">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-white opacity-90 mb-6">
                {slides[currentSlide].subtitle}
              </p>
              <Button 
                variant="accent" 
                size="lg"
                onClick={() => window.location.href = slides[currentSlide].buttonLink}
              >
                {slides[currentSlide].buttonText}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full text-white transition-colors"
        onClick={goToPrevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full text-white transition-colors"
        onClick={goToNextSlide}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === currentSlide ? 'bg-accent' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;