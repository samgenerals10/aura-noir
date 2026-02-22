/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * Learning notes:
 * - All TypeScript types/interfaces were removed (JS doesn't use them).
 * - Runtime logic is unchanged; UI/Tailwind classes should render exactly the same.
 * - Read the inline comments around state, effects, handlers, and data flow.
 */
import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Share2, Eye } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { buildWhatsAppURL } from '@/config/adminContact';
import { toast } from 'sonner';

const ProductCard = ({ product, onViewDetails }) => {
  const { state, dispatch } = useStore();
  const isLiked = state.likes.includes(product.id);
  const [showShare, setShowShare] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    dispatch({ type: 'ADD_TO_CART', product });
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleLike = (e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_LIKE', productId: product.id });
    toast(isLiked ? 'Removed from wishlist' : 'Added to wishlist', {
      icon: isLiked ? undefined : <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />,
    });
  };

  const shareOnWhatsApp = (e) => {
    e.stopPropagation();
    const url = buildWhatsAppURL({ product, currency: 'USD' });
    window.open(url, '_blank');
    setShowShare(false);
  };

  const shareOnInstagram = (e) => {
    e.stopPropagation();
    window.open('https://www.instagram.com/', '_blank');
    toast.info('Share this product on your Instagram story');
    setShowShare(false);
  };

  return (
    <div
      className="group relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden hover:border-gold/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
      onClick={() => onViewDetails(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-black">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full text-xs text-white/80 font-medium border border-white/20">
            Out of Stock
          </div>
        )}

        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleToggleLike}
            className={`p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
              isLiked
                ? 'bg-pink-500 border-pink-400 text-white'
                : 'bg-black/40 border-white/20 text-white hover:bg-pink-500/50 hover:border-pink-400/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShare(!showShare);
              }}
              className="p-2.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Share Dropdown */}
            {showShare && (
              <div className="absolute right-0 top-12 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-2 min-w-[160px] z-20 shadow-xl">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={shareOnInstagram}
                  className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  <span>Instagram</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick View Button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(product.rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-white/20'
              }`}
            />
          ))}
          <span className="text-xs text-white/40 ml-1">({product.rating})</span>
        </div>

        <h3 className="text-white font-semibold text-sm mb-1 truncate">{product.name}</h3>
        <p className="text-white/40 text-xs mb-3 line-clamp-1">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gold">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              product.inStock
                ? 'bg-black text-white hover:bg-black/90 hover:scale-105 active:scale-95'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;