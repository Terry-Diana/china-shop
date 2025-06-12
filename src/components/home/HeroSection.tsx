import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import TouchOptimizedCarousel from "../ui/TouchOptimizedCarousel";
import { slides } from "../../data/slides";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Preload all images
    const preloadPromises = slides.map((slide) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [slide.id]: true }));
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${slide.image}`);
          setImagesLoaded(prev => ({ ...prev, [slide.id]: true }));
          resolve();
        };
        img.src = slide.image;
      });
    });

    Promise.all(preloadPromises).then(() => {
      setIsLoading(false);
    });
  }, []);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getFallbackImage = () => {
    return "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
  };

  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden aspect-[16/9] md:aspect-[21/9] lg:aspect-[25/9] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden aspect-[16/9] md:aspect-[21/9] lg:aspect-[25/9]">
      {/* Mobile/Touch optimized carousel */}
      <div className="md:hidden h-full">
        <TouchOptimizedCarousel autoPlay={true} autoPlayInterval={5000}>
          {slides.map((slide) => (
            <div key={slide.id} className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getFallbackImage();
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-center px-6 bg-black/30">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="max-w-xl"
                >
                  <h1 className="text-2xl md:text-3xl font-bold text-accent mb-3">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-lg text-white opacity-90 mb-4">
                    {slide.subtitle}
                  </p>
                  <Button
                    variant="accent"
                    size="md"
                    onClick={() => (window.location.href = slide.buttonLink)}
                    aria-label={`Shop ${slide.title}`}
                  >
                    {slide.buttonText}
                  </Button>
                </motion.div>
              </div>
            </div>
          ))}
        </TouchOptimizedCarousel>
      </div>

      {/* Desktop carousel */}
      <div className="hidden md:block h-full">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`slide-${slides[currentSlide].id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getFallbackImage();
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-black/30">
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
                  onClick={() =>
                    (window.location.href = slides[currentSlide].buttonLink)
                  }
                  aria-label={`Shop ${slides[currentSlide].title}`}
                >
                  {slides[currentSlide].buttonText}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full text-white transition-colors z-20"
          onClick={goToPrevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full text-white transition-colors z-20"
          onClick={goToNextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentSlide ? "bg-accent" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? "true" : "false"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;