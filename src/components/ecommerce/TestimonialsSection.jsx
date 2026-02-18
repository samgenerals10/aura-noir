/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * Learning notes:
 * - All TypeScript types/interfaces were removed (JS doesn't use them).
 * - Runtime logic is unchanged; UI/Tailwind classes should render exactly the same.
 * - Read the inline comments around state, effects, handlers, and data flow.
 */
import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Verified Buyer',
    text: 'I love the quality of the products, and the customer service is exceptional.',
    rating: 5,
    initials: 'SM',
  },
  {
    name: 'David Chen',
    role: 'Fashion Enthusiast',
    text: 'Amazing collection! The Urban Comfort Sneakers exceeded my expectations.',
    rating: 5,
    initials: 'DC',
  },
  {
    name: 'Amara Johnson',
    role: 'Style Blogger',
    text: 'From browsing to checkout, the experience was seamless. The Eclipse High Tops are now my go-to statement piece.',
    rating: 5,
    initials: 'AJ',
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What Our{' '}
            <span className="bg-gradient-to-r from-pink-400 via-red-400 to-rose-300 bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          <p className="text-white/50 text-lg">Real reviews from real people</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="relative p-6 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl hover:border-pink-500/20 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-pink-500/20 mb-4" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                  <div className="text-xs text-white/40">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;