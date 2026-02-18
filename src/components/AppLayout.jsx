/**
 * AppLayout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The root layout component. It does two important things:
 *
 * 1. PROVIDES GLOBAL STATE — wraps the entire app with StoreContext.Provider
 *    so every component can access state and dispatch via useStore()
 *
 * 2. FETCHES PRODUCTS — loads products from Firestore on mount and puts them
 *    into global state via dispatch({ type: 'SET_PRODUCTS' })
 *
 * CONNECTIONS:
 *   → src/store/useStore.js       (initialState, reducer, StoreContext)
 *   → src/lib/firestore.js        (fetchProducts function)
 *   → All page components         (Header, ProductGrid, AdminPanel etc.)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useReducer, useMemo, useEffect } from 'react';

// StoreContext  → the React context object (the "channel" for global state)
// initialState  → the default values when the app first loads
// reducer       → the function that handles all state changes
// CONNECTS TO → src/store/useStore.js
import { StoreContext, initialState, reducer } from '@/store/useStore';

// fetchProducts → fetches all products from Firestore
// If Firestore is empty (first run), it seeds it with default products
// CONNECTS TO → src/lib/firestore.js
import { fetchProducts } from '@/lib/firestore';

// Notification functions for FCM push notifications
import { 
  requestNotificationPermission, 
  saveFCMToken,
  listenForForegroundNotifications 
} from '@/lib/notifications';

// All page section components
import Header             from '@/components/ecommerce/Header';
import Hero               from '@/components/ecommerce/Hero';
import CategoriesSection  from '@/components/ecommerce/CategoriesSection';
import ProductGrid        from '@/components/ecommerce/ProductGrid';
import FeaturesSection    from '@/components/ecommerce/FeaturesSection';
import TestimonialsSection from '@/components/ecommerce/TestimonialsSection';
import Footer             from '@/components/ecommerce/Footer';
import CartDrawer         from '@/components/ecommerce/CartDrawer';
import AuthModal          from '@/components/ecommerce/AuthModal';
import AdminPanel         from '@/components/ecommerce/AdminPanel';
import Wishlist           from '@/components/ecommerce/Wishlist';
import ChatBubble         from '@/components/ecommerce/ChatBubble';

const AppLayout = () => {

  // ── GLOBAL STATE SETUP ───────────────────────────────────────────────────
  // useReducer is like useState but for complex state with many actions.
  //
  // state    → the current global state object (cart, products, orders etc.)
  // dispatch → function to trigger state changes e.g. dispatch({ type: 'ADD_TO_CART', product })
  //
  // useReducer(reducer, initialState):
  //   reducer      → the function that handles each action type
  //   initialState → the starting values (from useStore.js)
  const [state, dispatch] = useReducer(reducer, initialState);


  // ── RESTORE USER FROM LOCALSTORAGE ───────────────────────────────────────
  // On first load, check if user was logged in previously
  // If yes, restore them to state so they don't have to log in again
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('luxestore_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', user });
      }
    } catch (err) {
      console.error('Failed to restore user:', err);
      localStorage.removeItem('luxestore_user'); // clear corrupted data
    }
  }, []);

  // ── REQUEST NOTIFICATION PERMISSION ───────────────────────────────────────
  // When user logs in, request permission for push notifications
  // This allows them to receive notifications even when app is closed
  useEffect(() => {
    if (!state.user) return;

    const setupNotifications = async () => {
      try {
        // Request permission and get FCM token
        const token = await requestNotificationPermission();
        
        if (token) {
          // Save token to Firestore so admin can send notifications
          await saveFCMToken(state.user.id, token);
          console.log('Notifications enabled');
        }
        
        // Listen for foreground notifications (when app is open)
        listenForForegroundNotifications();
        
      } catch (err) {
        console.error('Notification setup error:', err);
      }
    };

    setupNotifications();
  }, [state.user]);

  // ── FETCH PRODUCTS FROM FIRESTORE ────────────────────────────────────────
  // useEffect with [] runs ONCE when the app first loads (like componentDidMount).
  // It fetches all products from Firestore and puts them into global state.
  //
  // FLOW:
  //   1. App loads → productsLoading is true → ProductGrid shows spinner
  //   2. fetchProducts() gets products from Firestore
  //   3. dispatch SET_PRODUCTS → products go into state, loading becomes false
  //   4. ProductGrid re-renders with real products
  //
  // CONNECTS TO → src/lib/firestore.js → fetchProducts()
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Tell the store we're loading — shows spinner in ProductGrid
        dispatch({ type: 'SET_PRODUCTS_LOADING', loading: true });

        // Fetch products from Firestore
        // If collection is empty, firestore.js seeds it automatically
        const products = await fetchProducts();

        // Put products into global state — hides spinner, shows products
        dispatch({ type: 'SET_PRODUCTS', products });

      } catch (err) {
        console.error('Failed to load products:', err);
        // Even on error, stop the loading spinner
        dispatch({ type: 'SET_PRODUCTS_LOADING', loading: false });
      }
    };

    loadProducts(); // call the async function
  }, []); // [] → only run once on mount


  // ── COMPUTED VALUES ──────────────────────────────────────────────────────
  // useMemo caches computed values and only recalculates when dependencies change.
  // This prevents unnecessary recalculations on every render.

  // cartTotal → sum of (price × quantity) for all items in the cart
  // Only recalculates when state.cart changes
  const cartTotal = useMemo(
    () => state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [state.cart]
  );

  // cartCount → total number of items in the cart (sum of all quantities)
  // e.g. 2 watches + 1 bag = cartCount of 3
  const cartCount = useMemo(
    () => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    [state.cart]
  );

  // contextValue → the object passed to every component via useStore()
  // useMemo prevents a new object being created on every render
  // (which would cause unnecessary re-renders in child components)
  const contextValue = useMemo(
    () => ({ state, dispatch, cartTotal, cartCount }),
    [state, dispatch, cartTotal, cartCount]
  );


  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    // StoreContext.Provider wraps the entire app.
    // value={contextValue} makes state, dispatch, cartTotal, cartCount
    // available to ANY component inside via useStore()
    <StoreContext.Provider value={contextValue}>
      <div className="min-h-screen bg-black text-white">

        {/* Header is always visible — contains nav, cart button, search */}
        <Header />

        {/* Conditional rendering based on currentView:
            - 'admin' + user is admin → AdminPanel
            - 'wishlist' → Wishlist page
            - Otherwise → main shop page */}
        {state.currentView === 'admin' && state.user?.role === 'admin' ? (
          // Admin dashboard — only accessible to admin users
          // The ?. (optional chaining) prevents crash if state.user is null
          <AdminPanel />
        ) : state.currentView === 'wishlist' ? (
          // Wishlist page — shows all liked products
          <Wishlist />
        ) : (
          // Main shop page — what customers see
          <main>
            <Hero />
            <CategoriesSection />
            <ProductGrid />       {/* now reads from state.products (Firestore) */}
            <FeaturesSection />
            <TestimonialsSection />
          </main>
        )}

        <Footer />

        {/* These overlay components are always mounted but hidden until triggered */}
        <CartDrawer />  {/* slides in from right when state.isCartOpen is true */}
        <AuthModal />   {/* modal overlay when state.isAuthOpen is true */}
        <ChatBubble />  {/* floating chat bubble in bottom-right (only when logged in) */}

      </div>
    </StoreContext.Provider>
  );
};

export default AppLayout;