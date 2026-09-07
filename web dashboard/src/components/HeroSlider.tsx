import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { isAuthenticated, isAdmin } from '../utils/auth';

interface Slide {
  id: number;
  image: string;
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaTo: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/slider/slide1.jpg',
    heading: 'Smart Vehicle Access',
    subheading: 'Secure and automated vehicle entry management.',
    ctaLabel: 'Learn More',
    ctaTo: '#features' // Scroll to features, no auth needed
  },
  {
    id: 2,
    image: '/slider/slide2.jpg',
    heading: 'AI-Powered Vehicle Detection',
    subheading: 'Recognize vehicles in real-time with precision.',
    ctaLabel: 'See Live Feed',
    ctaTo: '/dashboard#live' // Navigate to dashboard Live Feed page
  },
  {
    id: 3,
    image: '/slider/slide3.jpg',
    heading: 'Intelligent Dashboard',
    subheading: 'Monitor entries, weather, and gate status in real-time.',
    ctaLabel: 'View Dashboard',
    ctaTo: '/dashboard' // Navigate to dashboard
  },
  {
    id: 4,
    image: '/slider/slide4.jpg',
    heading: 'Temporary Visitor Management',
    subheading: 'Easily manage temporary visitor access with expiry control.',
    ctaLabel: 'Add Visitor',
    ctaTo: '/dashboard#add-visitor' // Navigate to dashboard Add Visitor page
  },
  {
    id: 5,
    image: '/slider/slide5.jpg',
    heading: 'Smart, Connected, Secure',
    subheading: 'Modern AI solutions for vehicle and access control.',
    ctaLabel: 'Explore Features',
    ctaTo: '#features' // Scroll to features, no auth needed
  }
];

const AUTO_SLIDE_INTERVAL = 6500;

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearExistingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide((prev) => {
      if (index < 0) {
        return slides.length - 1;
      }
      if (index >= slides.length) {
        return 0;
      }
      return index;
    });
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    clearExistingInterval();
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      clearExistingInterval();
    };
  }, [clearExistingInterval]);

  const handleCTA = useCallback(
    (target: string, slideId?: number) => {
      // Handle anchor links on current page (scroll to section)
      if (target.startsWith('#') && !target.includes('/')) {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      // Check authentication status
      const authenticated = isAuthenticated();

      // If target is dashboard or any protected route
      if (target.startsWith('/dashboard')) {
        if (authenticated) {
          // Special handling for "Add Visitor" button (slide 4)
          // Admins should go to Manual Override, regular users to Add Temporary Visitor
          if (slideId === 4 && target.includes('#add-visitor')) {
            const admin = isAdmin();
            if (admin) {
              // Admin: redirect to Manual Override page
              navigate('/dashboard#manual');
            } else {
              // Regular user: go to Add Temporary Visitor page
              navigate('/dashboard#add-visitor');
            }
          } else {
            // User is logged in, navigate to dashboard (with optional hash for specific page)
            navigate(target);
          }
        } else {
          // User not logged in, redirect to signup
          navigate('/signup');
        }
        return;
      }

      // For other routes, navigate normally
      navigate(target);
    },
    [navigate]
  );

  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          {slides.map((slide, index) =>
            index === currentSlide ? (
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                role="img"
                aria-label={`${slide.heading} - ${slide.subheading}`}
              >
                <img
                  src={slide.image}
                  alt={slide.heading}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full py-20 flex">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[currentSlide].id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6 justify-center text-white w-full md:max-w-3xl items-center text-center mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-sm tracking-[0.4em] uppercase text-blue-200/80"
            >
              Smart Gate System
            </motion.span>
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {slides[currentSlide].heading}
            </motion.h2>
            <motion.p
              className="text-lg md:text-2xl text-gray-100/90 max-w-2xl backdrop-blur-sm bg-white/10 border border-white/10 rounded-2xl px-6 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {slides[currentSlide].subheading}
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCTA(slides[currentSlide].ctaTo, slides[currentSlide].id)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/90 text-gray-900 rounded-2xl font-semibold shadow-2xl shadow-blue-500/30 border border-white/40 hover:bg-white"
            >
              {slides[currentSlide].ctaLabel}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-6 md:px-10">
        <button
          aria-label="Previous slide"
          onClick={() => {
            prevSlide();
            clearExistingInterval();
          }}
          className="pointer-events-auto rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-3 text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          aria-label="Next slide"
          onClick={() => {
            nextSlide();
            clearExistingInterval();
          }}
          className="pointer-events-auto rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-3 text-white hover:bg-white/20 transition-all"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => {
              setCurrentSlide(index);
              clearExistingInterval();
            }}
            className={`h-3 rounded-full transition-all ${
              currentSlide === index ? 'w-10 bg-white' : 'w-3 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

