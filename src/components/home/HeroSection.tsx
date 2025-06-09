import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import Button from "../ui/Button";
import TouchOptimizedCarousel from "../ui/TouchOptimizedCarousel";
import { slides } from "../../data/slides";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

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

  const handleImageLoad = (slideId: number) => {
    setImagesLoaded(prev => ({ ...prev, [slideId]: true }));
    
    // Check if all images are loaded
    const allLoaded = slides.every(slide => 
      imagesLoaded[slide.id] || slide.id === slideId
    );
    
    if (allLoaded) {
      setIsLoading(false);
    }
  };

  const handleImageError = (slideId: number) => {
    setImageErrors(prev => ({ ...prev, [slideId]: true }));
    setImagesLoaded(prev => ({ ...prev, [slideId]: true }));
    
    // Check if all images are processed (loaded or errored)
    const allProcessed = slides.every(slide => 
      imagesLoaded[slide.id] || imageErrors[slide.id] || slide.id === slideId
    );
    
    if (allProcessed) {
      setIsLoading(false);
    }
  };

  const getFallbackImage = () => {
    return "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
  };

  const getSlideImage = (slide: any) => {
    return imageErrors[slide.id] ? getFallbackImage() : slide.image;
  };

  return (
    <div className="relative w-full overflow-hidden aspect-[16/9] md:aspect-[21/9] lg:aspect-[25/9]">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-gray-500">Loading hero content...</div>
          </div>
        </div>
      )}

      {/* Preload all images */}
      <div className="hidden">
        {slides.map((slide) => (
          <img
            key={slide.id}
            src={slide.image}
            alt=""
            onLoad={() => handleImageLoad(slide.id)}
            onError={() => handleImageError(slide.id)}
          />
        ))}
      </div>

      {/* Mobile/Touch optimized carousel */}
      <div className="md:hidden h-full">
        <TouchOptimizedCarousel autoPlay={true} autoPlayInterval={5000}>
          {slides.map((slide) => (
            <div key={slide.id} className="relative h-full">
              <img
                src={getSlideImage(slide)}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {imageErrors[slide.id] && (
                <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  Fallback image
                </div>
              )}
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
              src={getSlideImage(slides[currentSlide])}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            {imageErrors[slides[currentSlide].id] && (
              <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" />
                Using fallback image
              </div>
            )}
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