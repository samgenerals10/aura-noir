/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * Learning notes:
 * - All TypeScript types/interfaces were removed (JS doesn't use them).
 * - Runtime logic is unchanged; UI/Tailwind classes should render exactly the same.
 * - Read the inline comments around state, effects, handlers, and data flow.
 */
import React from 'react';
import { useStore } from '@/store/useStore';
import { ArrowRight } from 'lucide-react';

const categoryCards = [
  {
    id: 'bags',
    name: 'Luxury Bags',
    count: 48,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop',
    gradient: 'from-pink-900/60 via-transparent to-black/80',
  },
  {
    id: 'shoes',
    name: 'Premium Shoes',
    count: 92,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop',
    gradient: 'from-red-900/60 via-transparent to-black/80',
  },
  {
    id: 'watches',
    name: 'Designer Watches',
    count: 36,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
    gradient: 'from-purple-900/60 via-transparent to-black/80',
  },
];

const CategoriesSection = () => {
  const { dispatch } = useStore();

  const handleCategoryClick = (categoryId) => {
    dispatch({ type: 'SET_CATEGORY', category: categoryId });
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Shop by{' '}
            <span className="bg-gradient-to-r from-pink-400 via-red-400 to-rose-300 bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-white/50 text-lg">Explore our curated collections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryCards.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="group relative h-72 rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/30 transition-all duration-500"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                <p className="text-white/60 text-sm mb-4">{cat.count} Products</p>
                <div className="flex items-center space-x-2 text-sm text-white/80 group-hover:text-white transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;