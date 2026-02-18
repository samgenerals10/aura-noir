/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * Learning notes:
 * - All TypeScript types/interfaces were removed (JS doesn't use them).
 * - Runtime logic is unchanged; UI/Tailwind classes should render exactly the same.
 * - Read the inline comments around state, effects, handlers, and data flow.
 */
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';

const Hero = () => {
  const { dispatch } = useStore();

  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1748480959274-9d1b0db69c03?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlcmZ1bWVzJTIwYmFubmVyfGVufDB8fDB8fHww"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/30 via-transparent to-red-900/20" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-white/90 font-medium">New Collection 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Redefine</span>
            <br />
            <span className="bg-gradient-to-r from-pink-400 via-red-400 to-rose-300 bg-clip-text text-transparent">
              Your Style
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-white/60 mb-10 leading-relaxed max-w-lg">
            Discover curated luxury fashion pieces that blend timeless elegance with modern design. 
            Premium quality, delivered to your doorstep.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                dispatch({ type: 'SET_CATEGORY', category: null });
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 rounded-xl text-white font-semibold text-lg hover:from-pink-600 hover:via-red-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'SET_CATEGORY', category: 'watches' });
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-semibold text-lg hover:bg-white/20 hover:border-white/30 transition-all"
            >
              View Watches
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