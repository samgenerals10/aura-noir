/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * Learning notes:
 * - All TypeScript types/interfaces were removed (JS doesn't use them).
 * - Runtime logic is unchanged; UI/Tailwind classes should render exactly the same.
 * - Read the inline comments around state, effects, handlers, and data flow.
 */
import React from 'react';
import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

const features = [
  {
    icon: <Truck className="w-6 h-6" />,
    title: 'Global Delivery',
    description: 'Bespoke shipping for refined fragrances',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Authenticity',
    description: '100% genuine world-class ingredients',
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: 'Exquisite Care',
    description: 'Premium packaging for every essence',
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: 'Personal Stylist',
    description: 'Dedicated scent consulting available 24/7',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 border-t border-b border-white/5 scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-black border border-gold text-gold mb-4 group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;