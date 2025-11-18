'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Star, TrendingUp, Shield, Zap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerData {
  id: number;
  title: string;
  subtitle: string;
  description?: string;
  gradient: string;
  icon: React.ReactNode;
  badge?: string;
  badgeText?: string;
  stats?: {
    label: string;
    value: string;
  }[];
  emoji?: string;
  cta?: string;
}

const banners: BannerData[] = [
  {
    id: 1,
    title: 'NEED AN URGENT',
    subtitle: 'BLOOD TEST?',
    description: 'CHOOSE INDIA\'S FASTEST LAB',
    gradient: 'from-teal-400 to-cyan-500',
    icon: <Clock className="w-6 h-6" />,
    badge: 'REPORT IN',
    badgeText: '6 HOURS',
    stats: [
      { label: 'Rated Lab', value: '#1' },
      { label: 'Rating', value: '★ 4.9/5' },
    ],
    emoji: '👨‍⚕️',
  },
  {
    id: 2,
    title: 'FLAT 25% OFF',
    subtitle: 'ON ALL TESTS',
    description: 'Limited Time Offer - Book Now!',
    gradient: 'from-orange-400 to-red-500',
    icon: <Zap className="w-6 h-6" />,
    badge: 'SAVE',
    badgeText: '25%',
    stats: [
      { label: 'Trusted by', value: '1Mn+' },
      { label: 'Customers', value: 'Happy' },
    ],
    emoji: '🎉',
    cta: 'Book Now',
  },
  {
    id: 3,
    title: 'HOME COLLECTION',
    subtitle: 'AVAILABLE',
    description: 'Get tested from the comfort of your home',
    gradient: 'from-purple-400 to-pink-500',
    icon: <Shield className="w-6 h-6" />,
    badge: 'FREE',
    badgeText: 'PICKUP',
    stats: [
      { label: 'Safe', value: '100%' },
      { label: 'Hygienic', value: '✓' },
    ],
    emoji: '🏠',
    cta: 'Schedule Now',
  },
  {
    id: 4,
    title: 'MOST BOOKED',
    subtitle: 'FULL BODY CHECKUP',
    description: 'Comprehensive health screening package',
    gradient: 'from-blue-400 to-indigo-500',
    icon: <TrendingUp className="w-6 h-6" />,
    badge: 'POPULAR',
    badgeText: 'NOW',
    stats: [
      { label: 'Tests', value: '60+' },
      { label: 'Price', value: '₹999' },
    ],
    emoji: '💊',
    cta: 'View Package',
  },
];

export function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate banners
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, []);

  const currentBanner = banners[currentIndex];

  return (
    <div
      className="relative overflow-hidden rounded-2xl h-48 md:h-56 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Container with Transition */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              'absolute inset-0 transition-all duration-700 ease-in-out',
              index === currentIndex
                ? 'opacity-100 translate-x-0 z-10'
                : index < currentIndex
                ? 'opacity-0 -translate-x-full z-0'
                : 'opacity-0 translate-x-full z-0'
            )}
          >
            <div
              className={cn(
                'relative w-full h-full bg-gradient-to-r p-6 flex items-center justify-between overflow-hidden',
                banner.gradient
              )}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1">
                <h2 className="text-white text-xl md:text-2xl font-bold mb-1">
                  {banner.title}
                  <br />
                  <span className="text-2xl md:text-3xl">{banner.subtitle}</span>
                </h2>
                {banner.description && (
                  <p className="text-white/90 text-sm mb-3">{banner.description}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  {banner.badge && (
                    <div className="bg-white/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <div className="flex items-center gap-1 text-white font-bold text-xs">
                        {banner.icon}
                        <span>{banner.badge}</span>
                      </div>
                      <div className="text-white text-base font-bold">{banner.badgeText}</div>
                    </div>
                  )}
                  {banner.stats && (
                    <div className="flex items-center gap-4">
                      {banner.stats.map((stat, statIndex) => (
                        <div key={statIndex} className="text-white">
                          <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                          <div className="text-xs">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {banner.cta && (
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 group">
                      {banner.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>

              {/* Icon/Emoji */}
              <div className="relative z-10 flex-shrink-0 w-24 h-24 md:w-32 md:h-32">
                <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-5xl md:text-6xl">{banner.emoji || '🎯'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Next banner"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'transition-all duration-300 rounded-full',
              index === currentIndex
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            )}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {!isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-white"
            style={{
              width: '0%',
              animation: 'progressBar 5s linear forwards',
            }}
            key={currentIndex}
          />
        </div>
      )}
    </div>
  );
}
