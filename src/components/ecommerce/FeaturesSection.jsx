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
    title: 'Free Shipping',
    description: 'Free delivery on orders over $100',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Secure Payment',
    description: 'Your payment information is safe with us',
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: 'Easy Returns',
    description: '30-day return policy, no questions asked',
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: '24/7 Support',
    description: 'Dedicated customer support anytime you need',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-500/20 text-pink-400 mb-4 group-hover:scale-110 group-hover:border-pink-500/40 transition-all duration-300">
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