/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * Learning notes:
 * - All TypeScript types/interfaces were removed (JS doesn't use them).
 * - Runtime logic is unchanged; UI/Tailwind classes should render exactly the same.
 * - Read the inline comments around state, effects, handlers, and data flow.
 */
import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Quote } from 'lucide-react';
import { useStore } from '@/store/useStore';

// ── SCENT NARRATIVES ──────────────────────────────────────────────────────
const NARRATIVES = [
  "Perfume makes silence talk.",
  "Your scent is your soul's signature.",
  "The unseen, unforgettable accessory.",
  "Fragrance is the first layer of dressing.",
  "Define your essence, find your aura."
];

const Hero = () => {
  const { dispatch } = useStore();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5;
    }
  }, []);

  const [currentNarrative, setCurrentNarrative] = useState(0);
  const [displayText, setDisplayText]   = useState('');
  const [isTyping, setIsTyping]       = useState(true);

  useEffect(() => {
    let timer;
    if (isTyping) {
      if (displayText.length < NARRATIVES[currentNarrative].length) {
        timer = setTimeout(() => {
          setDisplayText(NARRATIVES[currentNarrative].slice(0, displayText.length + 1));
        }, 50);
      } else {
        timer = setTimeout(() => setIsTyping(false), 3000); // Hold for 3s
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, displayText.length - 1));
        }, 30);
      } else {
        setCurrentNarrative((prev) => (prev + 1) % NARRATIVES.length);
        setIsTyping(true);
      }
    }
    return () => clearTimeout(timer);
  }, [displayText, isTyping, currentNarrative]);

  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover animate-luxury-flow"
        >
          <source src="https://videos.pexels.com/video-files/33233525/14160276_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gold/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm text-white/90 font-medium tracking-wide uppercase">New Collection 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-tight mb-6">
            <span className="text-white">Find Your</span>
            <br />
            <span className="text-gold">
              Aura
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-white/60 mb-8 leading-relaxed max-w-lg">
            Discover our world-class fragrance collection, crafted for those who define their own essence.
            Premium scents, delivered with luxury in mind.
          </p>

          {/* Scent Narrative — Typewriter Effect */}
          <div className="h-16 mb-10 flex items-start space-x-3">
            <div className="mt-1 p-1 rounded-sm bg-black border border-gold/30">
              <Quote className="w-4 h-4 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-medium text-white italic tracking-wide">
                {displayText}
                <span className="inline-block w-1.5 h-6 ml-1 bg-gold animate-pulse align-middle" />
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-2 font-bold">
                Scent Narrative
              </p>
            </div>
          </div>

          


          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                dispatch({ type: 'SET_CATEGORY', category: null });
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex items-center justify-center px-8 py-4 bg-black rounded-sm text-white font-semibold text-lg hover:bg-black/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'SET_CATEGORY', category: 'all' });
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex items-center justify-center px-8 py-4 bg-black rounded-sm text-white font-semibold text-lg hover:bg-black/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Shop Collection
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'SET_CATEGORY', category: 'signature' });
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-sm text-white font-semibold text-lg hover:bg-white/10 hover:border-gold/30 transition-all active:scale-[0.98]"
            >
              Signature Scents
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-white/50">Products</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm text-white/50">Customers</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <div className="text-2xl font-bold text-white">4.9</div>
              <div className="text-sm text-white/50">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;