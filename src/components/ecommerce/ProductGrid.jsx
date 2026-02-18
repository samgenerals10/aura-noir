/**
 * ProductGrid.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays all products in a filterable, sortable grid.
 *
 * KEY CHANGE: Products now come from state.products (Firestore via useStore)
 * instead of the static @/data/products.js file.
 *
 * CONNECTIONS:
 *   → src/store/useStore.js       (state.products, state.selectedCategory etc.)
 *   → src/lib/firestore.js        (categories list)
 *   → src/components/ecommerce/ProductCard.jsx
 *   → src/components/ecommerce/ProductModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useMemo, useState } from 'react';
import { Grid3X3, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';

// categories is still static — imported from firestore.js
// products are NO LONGER imported from here — they come from Firestore via useStore
import { categories } from '@/lib/firestore';

import { useStore } from '@/store/useStore';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';

const ProductGrid = () => {
  // state.products       → array of products loaded from Firestore
  // state.productsLoading → true while fetching from Firestore
  // state.selectedCategory → current category filter (e.g. 'bags')
  // state.searchQuery    → current search text
  const { state, dispatch } = useStore();

  const [sortBy, setSortBy]               = useState('featured');
  const [showSort, setShowSort]           = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // filteredProducts → derived from state.products (Firestore data)
  // Recalculates when products, category, search, or sort changes
  const filteredProducts = useMemo(() => {
    // Start with ALL products from Firestore (via global state)
    // Previously this was: let filtered = [...products] from static file
    let filtered = [...state.products];

    // Filter by selected category
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === state.selectedCategory);
    }

    // Filter by search query — checks name, description, and category
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Sort the filtered results
    switch (sortBy) {
      case 'price-low':  filtered.sort((a, b) => a.price - b.price);                    break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price);                    break;
      case 'rating':     filtered.sort((a, b) => b.rating - a.rating);                  break;
      case 'name':       filtered.sort((a, b) => a.name.localeCompare(b.name));          break;
    }

    return filtered;
  }, [state.products, state.selectedCategory, state.searchQuery, sortBy]);
  //         ↑ now depends on state.products instead of the static products array

  const sortOptions = [
    { value: 'featured',   label: 'Featured' },
    { value: 'price-low',  label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating',     label: 'Highest Rated' },
    { value: 'name',       label: 'A-Z' },
  ];

  return (
    <section id="products" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Our{' '}
            <span className="bg-gradient-to-r from-pink-400 via-red-400 to-rose-300 bg-clip-text text-transparent">
              Collection
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Handpicked luxury items crafted with precision and passion
          </p>
        </div>

        {/* ── LOADING STATE ── */}
        {/* Shows a spinner while products are being fetched from Firestore */}
        {/* state.productsLoading is set to false once fetchProducts() completes */}
        {state.productsLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
            <p className="text-white/40 text-sm">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">

              {/* Category filter buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => dispatch({ type: 'SET_CATEGORY', category: cat.id })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      state.selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/25'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{sortOptions.find((s) => s.value === sortBy)?.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSort ? 'rotate-180' : ''}`} />
                </button>

                {showSort && (
                  <div className="absolute right-0 top-12 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl p-1.5 min-w-[200px] z-20 shadow-xl">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setShowSort(false); }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                          sortBy === option.value
                            ? 'bg-gradient-to-r from-pink-500/20 to-red-500/20 text-pink-300'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-white/40">
                Showing <span className="text-white/70 font-medium">{filteredProducts.length}</span>{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            {/* Product Grid or Empty State */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Grid3X3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/60 mb-2">No products found</h3>
                <p className="text-white/40 mb-6">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_CATEGORY', category: 'all' });
                    dispatch({ type: 'SET_SEARCH', query: '' });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl text-white font-medium hover:from-pink-600 hover:to-red-600 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
  );
};

export default ProductGrid;