/**
 * Wishlist.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays all products the user has liked/added to their wishlist.
 * 
 * CONNECTIONS:
 *   → src/store/useStore.js         (state.likes, state.products)
 *   → src/components/ecommerce/ProductCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useMemo, useState } from 'react';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProductCard from '@/components/ecommerce/ProductCard';
import ProductModal from '@/components/ecommerce/ProductModal';

const Wishlist = () => {
  const { state } = useStore();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Get all products that are in the user's likes array
  // state.likes is an array of product IDs e.g. ['1', '3', '7']
  // state.products is the full products array from Firestore
  const likedProducts = useMemo(() => {
    return state.products.filter((product) => state.likes.includes(product.id));
  }, [state.products, state.likes]);

  // Calculate total value of wishlist
  const wishlistValue = useMemo(() => {
    return likedProducts.reduce((sum, product) => sum + product.price, 0);
  }, [likedProducts]);

  return (
    <section className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-black border border-gold mb-4">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Your{' '}
            <span className="text-gold">
              Wishlist
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            {likedProducts.length > 0 
              ? `${likedProducts.length} ${likedProducts.length === 1 ? 'item' : 'items'} you love`
              : 'Start adding products you love'
            }
          </p>

          {/* Wishlist stats */}
          {likedProducts.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                <ShoppingBag className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-white/70">
                  <span className="font-semibold text-white">{likedProducts.length}</span> Items
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-white/70">
                  Total: <span className="font-semibold text-white">${wishlistValue.toFixed(2)}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist Grid or Empty State */}
        {likedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          // Empty state when no products are liked
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-sm bg-white/5 border border-white/10 mb-6">
              <Heart className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-semibold text-white/60 mb-2">Your wishlist is empty</h3>
            <p className="text-white/40 mb-6 max-w-md mx-auto">
              Browse our products and click the heart icon to save items you love
            </p>
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black rounded-xl text-white font-medium hover:bg-black/90 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Start Shopping</span>
            </a>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </section>
  );
};

export default Wishlist;