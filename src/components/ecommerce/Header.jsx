/**
 * Header.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The main navigation bar at the top of the app.
 *
 * KEY FIX: Admin button is now ALWAYS visible (not conditional on being logged in).
 * Clicking it prompts login if you're not logged in as admin.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, Shield, Heart, MessageSquare } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { listenToAllConversations } from '@/lib/messaging';

const Header = () => {
  const { state, dispatch, cartCount } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Listen to conversations for unread count (admin only)
  useEffect(() => {
    if (state.user?.role !== 'admin') return;

    const unsubscribe = listenToAllConversations((conversations) => {
      // Sum up unread messages for admin
      const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount?.admin || 0), 0);
      setUnreadMessages(total);
    });

    return () => unsubscribe();
  }, [state.user]);

  // handleAdminClick → handles the Admin button click logic
  // Always visible button, but behavior changes based on auth state
  const handleAdminClick = () => {
    if (state.user?.role === 'admin') {
      // User is logged in as admin → toggle between shop and admin view
      dispatch({
        type: 'SET_VIEW',
        view: state.currentView === 'admin' ? 'shop' : 'admin',
      });
    } else {
      // User is NOT logged in as admin → prompt them to log in
      dispatch({ type: 'TOGGLE_AUTH' });
      
      if (state.user && state.user.role !== 'admin') {
        // Logged in but not as admin
        toast.info('Admin access required. Please sign in with an admin account.');
      } else {
        // Not logged in at all
        toast.info('Please sign in with an admin account to access the admin panel.');
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'shop' })}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-rose-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-pink-400 via-red-400 to-rose-300 bg-clip-text text-transparent">
              Aura-Noir
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => {
                dispatch({ type: 'SET_VIEW', view: 'shop' });
                dispatch({ type: 'SET_CATEGORY', category: 'all' });
              }}
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              Shop All
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'SET_VIEW', view: 'shop' });
                dispatch({ type: 'SET_CATEGORY', category: 'bags' });
              }}
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              Bags
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'SET_VIEW', view: 'shop' });
                dispatch({ type: 'SET_CATEGORY', category: 'shoes' });
              }}
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              Shoes
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'SET_VIEW', view: 'shop' });
                dispatch({ type: 'SET_CATEGORY', category: 'watches' });
              }}
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              Watches
            </button>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={state.searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">

            {/* ── ADMIN BUTTON (ALWAYS VISIBLE) ── */}
            {/* Button appearance changes based on whether user is logged in as admin */}
            <button
              onClick={handleAdminClick}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all text-sm ${
                state.user?.role === 'admin'
                  // Logged in as admin → pink/red gradient (active state)
                  ? 'bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 text-pink-300 hover:text-white hover:border-pink-400/50'
                  // Not admin → subtle gray (inactive state)
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>
                {/* Show different text based on state */}
                {state.user?.role === 'admin' 
                  ? (state.currentView === 'admin' ? 'Store' : 'Admin') // toggle label
                  : 'Admin'                                              // default label
                }
              </span>
            </button>

            {/* Wishlist button — shows count of liked items */}
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'wishlist' })}
              className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
            >
              <Heart className={`w-5 h-5 transition-all ${
                state.likes.length > 0 ? 'text-pink-400 fill-pink-400' : 'text-white/70'
              }`} />
              {/* Badge showing liked items count */}
              {state.likes.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                  {state.likes.length}
                </span>
              )}
            </button>

            {/* Messages button — admin only, shows unread count */}
            {state.user?.role === 'admin' && (
              <button
                onClick={() => {
                  dispatch({ type: 'SET_VIEW', view: 'admin' });
                  // Auto-switch to messages tab by dispatching a custom action
                  // We'll need to add this to the store or use a different approach
                  // For now, we'll use localStorage to communicate with AdminPanel
                  localStorage.setItem('admin_active_tab', 'messages');
                  // Trigger a custom event that AdminPanel can listen to
                  window.dispatchEvent(new CustomEvent('switchAdminTab', { detail: 'messages' }));
                }}
                className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
              >
                <MessageSquare className="w-5 h-5 text-white/70" />
                {/* Badge showing unread messages count */}
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
            )}

            {/* User account button */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_AUTH' })}
              className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
            >
              <User className="w-5 h-5 text-white/70" />
              {/* Green dot when logged in */}
              {state.user && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
              )}
            </button>

            {/* Cart button */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
            >
              <ShoppingCart className="w-5 h-5 text-white/70" />
              {/* Badge showing cart count */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white/70" />
              ) : (
                <Menu className="w-5 h-5 text-white/70" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-2 pt-4 space-y-3">

            {/* Mobile search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={state.searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50"
              />
            </div>

            {/* Category links */}
            {['all', 'bags', 'shoes', 'watches'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  dispatch({ type: 'SET_CATEGORY', category: cat });
                  dispatch({ type: 'SET_VIEW', view: 'shop' });
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all capitalize"
              >
                {cat === 'all' ? 'Shop All' : cat}
              </button>
            ))}

            {/* Admin button in mobile menu — also always visible */}
            <button
              onClick={() => {
                handleAdminClick();
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 hover:bg-white/5 rounded-lg transition-all ${
                state.user?.role === 'admin' 
                  ? 'text-pink-400 hover:text-pink-300'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {state.user?.role === 'admin'
                ? (state.currentView === 'admin' ? 'Back to Store' : 'Admin Panel')
                : 'Admin Panel'
              }
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;