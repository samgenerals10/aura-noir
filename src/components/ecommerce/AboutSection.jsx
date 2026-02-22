import React from 'react';
import { Sparkles, Heart, Clock } from 'lucide-react';

const AboutSection = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-24">
        {/* Brand Narrative */}
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Our <span className="text-gold italic">Story</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-2xl mx-auto">
            Aura Noir is a luxury fragrance brand offering curated perfumes and scented candles 
            designed to feel personal, refined, and timeless.
          </p>
        </div>

        {/* Visual Break / Image Placeholder */}
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 group">
          <img 
            src="https://images.unsplash.com/photo-1595131838555-d3e9114d6935?w=1200&auto=format&fit=crop" 
            alt="Fragrance Curation"
            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-10 left-10">
            <div className="text-gold text-sm tracking-[0.3em] uppercase mb-2">Masterfully Crafted</div>
            <div className="text-2xl font-semibold">Fine Fragrances</div>
          </div>
        </div>

        {/* Philosophy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-10">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold">Personal</h3>
            <p className="text-white/40 leading-relaxed">
              We believe scent is the most intimate accessory. Each creation is balanced to 
              resonate with your unique identity.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold">Refined</h3>
            <p className="text-white/40 leading-relaxed">
              Curated with precision using world-class ingredients. Effortlessly elegant, 
              designed for the discerning observer.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold">Timeless</h3>
            <p className="text-white/40 leading-relaxed">
              Each scent is created to become a signature — subtle, memorable, and 
              resisting the transient nature of trends.
            </p>
          </div>
        </div>

        {/* Closing Mission */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-6">
          <div className="text-gold tracking-[0.2em] text-xs uppercase">The Aura Noir Promise</div>
          <h2 className="text-3xl font-bold italic">&quot;Effortlessly Elegant&quot;</h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Our mission is simple: to help you define your aura through scents that leave 
            a lasting impression without ever raising their voice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
