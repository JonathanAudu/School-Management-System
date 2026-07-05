'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSlider({ slides }: { slides: any[] }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    if (!slides || slides.length === 0) {
        return (
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900">
                <div className="container mx-auto px-6 relative z-10 text-white text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">Welcome to St. Augustine Academy</h1>
                </div>
            </section>
        );
    }

    const slide = slides[currentSlide];

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {slides.map((s, index) => (
                <div
                    key={s.id}
                    className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <Image
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${s.image}`}
                        alt={s.title || 'Slide Image'}
                        fill
                        className="object-cover"
                        priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-slate-900/20"></div>
                </div>
            ))}

            <div className="container mx-auto px-6 relative z-10 text-white mt-16 transition-all duration-500 transform translate-y-0 opacity-100">
                <div className="max-w-3xl">
                    {slide.subtitle && (
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-medium tracking-wide mb-6">
                            {slide.subtitle}
                        </span>
                    )}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-xl text-white">
                        {slide.title}
                    </h1>
                    {slide.button_text && slide.button_link && (
                        <div className="flex flex-col sm:flex-row gap-4 mt-10">
                            <Link href={slide.button_link} className="btn-primary">
                                {slide.button_text}
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Slider Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            )}
        </section>
    );
}
