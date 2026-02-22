/**
 * useStore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the GLOBAL STATE for the entire app.
 * Think of it like the app's memory — cart items, orders, user, products etc.
 *
 * HOW IT WORKS:
 * - `initialState` → the starting values when the app first loads
 * - `reducer`      → a function that handles every state change
 * - `StoreContext` → makes the state available to every component
 * - `useStore`     → the hook components use to READ state and DISPATCH actions
 *
 * CONNECTIONS:
 *   → src/components/AppLayout.jsx   (wraps the app with StoreContext.Provider)
 *   → src/lib/firestore.js           (fetches products from Firebase)
 *   → Every component that calls useStore()
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext } from 'react';

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
// These are the default values when the app first loads.
// Every key here becomes part of `state` in every component.

const initialState = {
  // products → array of products loaded from Firestore
  // Starts empty — AppLayout fetches from Firestore on mount and fills this
  products: [],

  // productsLoading → true while fetching products from Firestore
  // Used to show a loading spinner in ProductGrid
  productsLoading: true,

  // cart → array of { product, quantity } objects
  // e.g. [{ product: { id: '1', name: 'Watch', price: 110 }, quantity: 2 }]
  cart: [],

  // likes → array of product IDs the user has liked
  // e.g. ['1', '3', '7']
  likes: [],

  // user → the logged-in user object, or null if not logged in
  // e.g. { id: 'abc', name: 'Sam', email: 'sam@gmail.com', role: 'admin' }
  user: null,

  // orders → array of order objects
  // Pre-loaded with 3 demo orders so the admin dashboard isn't empty
  orders: [
    {
      id: 'ORD-001',
      items: [],
      total: 299.99,
      status: 'delivered',
      date: '2026-02-10',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    },
    {
      id: 'ORD-002',
      items: [],
      total: 149.50,
      status: 'shipped',
      date: '2026-02-12',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
    },
    {
      id: 'ORD-003',
      items: [],
      total: 599.00,
      status: 'pending',
      date: '2026-02-14',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
    },
  ],

  isCartOpen:       false, // controls whether CartDrawer is visible
  isAuthOpen:       false, // controls whether AuthModal is visible
  currentView:      'shop', // 'shop' | 'admin' | 'wishlist' | 'about' | 'contact'
  searchQuery:      '',     // current search input value
  selectedCategory: 'all', // current category filter
};


// ─── REDUCER ──────────────────────────────────────────────────────────────────
// The reducer is a pure function that takes the current state + an action,
// and returns the NEW state. It never mutates state directly.
//
// HOW TO READ IT:
//   action.type  → what happened (e.g. 'ADD_TO_CART')
//   action.*     → extra data needed (e.g. action.product, action.productId)
//   ...state     → spread operator — copies all existing state fields
//                  so we only change what we need to

function reducer(state, action) {
  switch (action.type) {

    // ── PRODUCT ACTIONS (NEW — connected to Firestore) ──────────────────────

    // SET_PRODUCTS → called by AppLayout after fetching from Firestore
    // Replaces the products array with fresh data from the database
    // action.products → array of product objects from Firestore
    case 'SET_PRODUCTS':
      return {
        ...state,
        products:        action.products, // replace products with Firestore data
        productsLoading: false,            // hide the loading spinner
      };

    // SET_PRODUCTS_LOADING → called before Firestore fetch starts
    // Shows a loading spinner while products are being fetched
    case 'SET_PRODUCTS_LOADING':
      return { ...state, productsLoading: action.loading };

    // ADD_PRODUCT → called by AdminPanel after addProduct() saves to Firestore
    // Adds the new product to the local state so UI updates instantly
    // without needing to re-fetch from Firestore
    // action.product → the new product object returned by Firestore
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.product], // append to end of array
      };

    // UPDATE_PRODUCT → called by AdminPanel after updateProduct() saves to Firestore
    // Finds the matching product by ID and replaces it with the updated version
    // action.product → the updated product object
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) =>
          // if this product's ID matches, replace it; otherwise keep it
          p.id === action.product.id ? action.product : p
        ),
      };

    // DELETE_PRODUCT → called by AdminPanel after deleteProduct() removes from Firestore
    // Filters out the deleted product from local state
    // action.productId → the ID of the product to remove
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.productId),
      };


    // ── CART ACTIONS ─────────────────────────────────────────────────────────

    // ADD_TO_CART → adds a product to the cart
    // If the product is already in the cart, increases its quantity by 1
    // action.product → the full product object to add
    case 'ADD_TO_CART': {
      // Check if this product is already in the cart
      const existing = state.cart.find((item) => item.product.id === action.product.id);

      if (existing) {
        // Product already in cart — just increase quantity
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 } // increment quantity
              : item                                      // leave other items alone
          ),
        };
      }

      // Product not in cart yet — add it with quantity 1
      return {
        ...state,
        cart: [...state.cart, { product: action.product, quantity: 1 }],
      };
    }

    // REMOVE_FROM_CART → removes a product completely from the cart
    // action.productId → ID of the product to remove
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        // filter() keeps all items EXCEPT the one matching productId
        cart: state.cart.filter((item) => item.product.id !== action.productId),
      };

    // UPDATE_QUANTITY → changes the quantity of a cart item
    // If quantity becomes 0 or less, removes the item entirely
    // action.productId → which product to update
    // action.quantity  → the new quantity
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        // Quantity hit zero — remove the item
        return {
          ...state,
          cart: state.cart.filter((item) => item.product.id !== action.productId),
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };

    // CLEAR_CART → empties the entire cart (used after successful payment)
    case 'CLEAR_CART':
      return { ...state, cart: [] };


    // ── LIKES ─────────────────────────────────────────────────────────────────

    // TOGGLE_LIKE → adds or removes a product ID from the likes array
    // action.productId → the product being liked/unliked
    case 'TOGGLE_LIKE': {
      const isLiked = state.likes.includes(action.productId);
      return {
        ...state,
        likes: isLiked
          ? state.likes.filter((id) => id !== action.productId) // unlike — remove
          : [...state.likes, action.productId],                  // like — add
      };
    }


    // ── AUTH ──────────────────────────────────────────────────────────────────

    // SET_USER → saves the logged-in user and closes the auth modal
    // action.user → user object from Firebase Auth
    case 'SET_USER':
      return { ...state, user: action.user, isAuthOpen: false };


    // ── ORDERS ────────────────────────────────────────────────────────────────

    // ADD_ORDER → adds a new order (called after payment initialization)
    // action.order → the new order object
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.order] };

    // UPDATE_ORDER_STATUS → changes the status of an existing order
    // Used by AdminPanel dropdowns and payment callbacks
    // action.orderId → which order to update
    // action.status  → new status ('pending' | 'paid' | 'shipped' | 'delivered')
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: action.status } : o
        ),
      };


    // ── UI TOGGLES ────────────────────────────────────────────────────────────

    // TOGGLE_CART → opens or closes the CartDrawer
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: !state.isCartOpen };

    // TOGGLE_AUTH → opens or closes the AuthModal
    case 'TOGGLE_AUTH':
      return { ...state, isAuthOpen: !state.isAuthOpen };

    // SET_VIEW → switches between 'shop' and 'admin' and 'wishlist' views
    // action.view → 'shop' | 'admin' | 'wishlist'
    case 'SET_VIEW':
      return { ...state, currentView: action.view };

    // SET_SEARCH → updates the search query (used by Header search input)
    // action.query → the search string typed by the user
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };

    // SET_CATEGORY → updates the selected category filter
    // action.category → e.g. 'bags', 'shoes', 'watches', 'all'
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.category };

    // Default: if the action type isn't recognized, return state unchanged
    default:
      return state;
  }
}


// ─── CONTEXT ──────────────────────────────────────────────────────────────────
// createContext creates a "channel" that passes data through the component tree
// without having to pass props manually at every level.
//
// null is just the default value — it gets replaced by the real value
// when StoreContext.Provider wraps the app in AppLayout.jsx
export const StoreContext = createContext(null);


// ─── useStore HOOK ────────────────────────────────────────────────────────────
// This is the hook every component calls to access global state.
//
// Usage in any component:
//   const { state, dispatch, cartTotal, cartCount } = useStore();
//
// state.products → all products from Firestore
// state.cart     → current cart items
// dispatch({ type: 'ADD_TO_CART', product }) → triggers a state change
export function useStore() {
  const context = useContext(StoreContext);

  // If useStore() is called outside of StoreContext.Provider, throw a clear error
  // This helps catch bugs early during development
  if (!context) throw new Error('useStore must be used within StoreProvider');

  return context;
}

// Export initialState and reducer so AppLayout.jsx can use them with useReducer
export { initialState, reducer };
