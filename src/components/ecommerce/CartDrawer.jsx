// /**
//  * CartDrawer.jsx
//  * ─────────────────────────────────────────────────────────────────────────────
//  * This is the sliding cart panel that appears on the right side of the screen.
//  * It handles:
//  *   1. Displaying cart items
//  *   2. Currency selection (auto-detected from user's browser location)
//  *   3. Checkout form (name, email, phone)
//  *   4. Payment buttons (Paystack, Stripe, Flutterwave)
//  *
//  * CONNECTIONS:
//  *   → src/firebase/firebase.js     (Firebase app + functions connection)
//  *   → src/utils/currency.js        (currency detection + formatting)
//  *   → src/store/useStore.js        (global cart state)
//  *   → functions/index.js           (Firebase Cloud Functions on Google's servers)
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// // ─── IMPORTS ─────────────────────────────────────────────────────────────────

// // React core — useState manages local state, useEffect runs code on mount
// import React, { useState, useEffect } from 'react';

// // Icons from lucide-react icon library
// // Each one is a small SVG component used in the UI
// import {
//   X,             // ✕ close button
//   Minus,         // − decrease quantity button
//   Plus,          // + increase quantity button
//   Trash2,        // 🗑 remove item button
//   ShoppingBag,   // 🛍 cart icon in header + empty state
//   CreditCard,    // 💳 checkout button icon
//   Loader2,       // ⟳ spinning loading icon during payment
//   AlertCircle,   // ⚠ error message icon
//   ChevronDown,   // ˅ dropdown arrow for currency picker
// } from 'lucide-react';

// // httpsCallable — this is how we call our Firebase Cloud Functions from React.
// // Instead of fetch() or axios, Firebase handles the network request,
// // authentication headers, and CORS automatically.
// // CONNECTS TO → src/firebase/firebase.js → functions/index.js
// import { httpsCallable } from 'firebase/functions';

// // functions — the Firebase Functions instance we initialized in firebase.js
// // This tells httpsCallable which Firebase project to talk to
// // CONNECTS TO → src/firebase/firebase.js
// import { functions } from '@/firebase/firebase';

// // useStore — our global state manager (Zustand or Context)
// // Gives us: state (cart items, isCartOpen), dispatch (actions), cartTotal, cartCount
// // CONNECTS TO → src/store/useStore.js
// import { useStore } from '@/store/useStore';

// // toast — shows small popup notification messages (success, error)
// // e.g. "Redirecting to Stripe..." or "Payment failed"
// import { toast } from 'sonner';

// // Currency utilities — all currency-related logic is in one place
// // CONNECTS TO → src/utils/currency.js
// // import {
// //   CURRENCIES,        // array of all supported currencies with symbols and provider info
// //   detectCurrency,    // detects user's currency from their browser locale
// //   formatAmount,      // formats a number like 49.99 → "$49.99" or "GH₵49.99"
// // } from '@/utils/currency';


// // Currency utilities — all currency-related logic is in one place
// // CONNECTS TO → src/utils/currency.js
// import { 
//   CURRENCIES, // array of all supported currencies with symbols and provider info
//   detectCurrency, // detects user's currency from their browser locale
//   formatAmount, // formats a number like 49.99 → "$49.99" or "GH₵49.99"
//  } from '@/lib/currency';


// // ─── PAYMENT PROVIDER CONFIG ──────────────────────────────────────────────────
// // This object defines how each payment button looks in the UI.
// // label   → button text
// // color   → Tailwind gradient classes for the button background
// // shadow  → Tailwind shadow color class
// // logo    → emoji used as a quick icon (swap for <img> if you have real logos)

// const PROVIDERS = {
//   paystack: {
//     label:  'Paystack',
//     color:  'from-[#00C3F7] to-[#0193D7]',   // blue gradient (Paystack brand color)
//     shadow: 'shadow-[#00C3F7]/25',
//     logo:   '🇳🇬',
//   },
//   stripe: {
//     label:  'Stripe',
//     color:  'from-[#6772E5] to-[#4F56C8]',   // purple gradient (Stripe brand color)
//     shadow: 'shadow-[#6772E5]/25',
//     logo:   '💳',
//   },
//   flutterwave: {
//     label:  'Flutterwave',
//     color:  'from-[#F5A623] to-[#E8890C]',   // orange gradient (Flutterwave brand color)
//     shadow: 'shadow-[#F5A623]/25',
//     logo:   '🌍',
//   },
// };


// // ─── COMPONENT ───────────────────────────────────────────────────────────────
// const CartDrawer = () => {

//   // ── GLOBAL STATE (from our store) ──────────────────────────────────────────
//   // state        → contains state.cart (array of items) and state.isCartOpen (boolean)
//   // dispatch     → function to send actions like ADD_ORDER, CLEAR_CART, TOGGLE_CART
//   // cartTotal    → computed total price of all items in cart (e.g. 149.97)
//   // cartCount    → total number of items in cart (e.g. 3)
//   // CONNECTS TO → src/store/useStore.js
//   const { state, dispatch, cartTotal, cartCount } = useStore();


//   // ── LOCAL STATE ────────────────────────────────────────────────────────────
//   // These only exist inside this component

//   // true while waiting for payment provider to respond — disables buttons
//   const [isCheckingOut, setIsCheckingOut] = useState(false);

//   // the 3 form fields the user fills in before paying
//   const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '' });

//   // toggles between showing the order summary vs the checkout form + payment buttons
//   const [showCheckout, setShowCheckout] = useState(false);

//   // stores any payment error message to show in the UI (e.g. "Card declined")
//   const [paymentError, setPaymentError] = useState('');

//   // the currently selected currency code (e.g. 'USD', 'GHS', 'GBP')
//   // starts as 'USD' then gets auto-detected in useEffect below
//   const [currency, setCurrency] = useState('USD');

//   // controls whether the currency dropdown list is visible or hidden
//   const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);


//   // ── EFFECTS ────────────────────────────────────────────────────────────────
//   // useEffect with [] runs ONCE when the component first mounts (like componentDidMount)
//   // Both effects must be here ABOVE the early return — this is the Rules of Hooks fix

//   // Effect 1: Auto-detect the user's currency from their browser locale
//   // e.g. a user in Ghana gets GHS, a user in UK gets GBP
//   // CONNECTS TO → src/utils/currency.js → detectCurrency()
//   useEffect(() => {
//     const detected = detectCurrency(); // returns a currency code like 'GHS'
//     setCurrency(detected);             // updates the currency state
//   }, []); // [] means run once on mount, never again


//   // Effect 2: Handle payment redirect callbacks
//   // When Paystack or Flutterwave redirect the user back to our app after payment,
//   // they add ?payment=success&provider=paystack&ref=ORD-ABC to the URL.
//   // This effect checks for that and marks the order as paid.
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search); // parse URL query params

//     if (params.get('payment') === 'success') {         // if payment was successful
//       const ref      = params.get('ref');              // get order ID from URL
//       const provider = params.get('provider') || 'unknown'; // get provider name from URL

//       if (ref) {
//         // Mark the order as paid in our global store
//         dispatch({ type: 'UPDATE_ORDER_STATUS', orderId: ref, status: 'paid' });

//         // Clear the cart since order is complete
//         dispatch({ type: 'CLEAR_CART' });

//         // Show success notification
//         toast.success(`Payment confirmed via ${PROVIDERS[provider]?.label || provider}! Order ${ref} is now paid.`);

//         // Clean up the URL — remove the ?payment=success part so it doesn't trigger again on refresh
//         window.history.replaceState({}, '', window.location.pathname);
//       }
//     }
//   }, []); // [] means run once on mount


//   // ── EARLY RETURN ───────────────────────────────────────────────────────────
//   // If the cart is closed, render nothing at all.
//   // This MUST come after all hooks above — React requires hooks to always run
//   // in the same order, so no hooks can come after this line.
//   if (!state.isCartOpen) return null;


//   // ── HELPER FUNCTIONS ───────────────────────────────────────────────────────

//   // createOrder — builds a standard order object used by all 3 payment handlers
//   // orderId  → unique order ID generated in each handler (e.g. "ORD-K3X9P")
//   // status   → 'pending' by default, becomes 'paid' after payment confirmation
//   const createOrder = (orderId, status = 'pending') => ({
//     id:            orderId,
//     items:         state.cart,       // snapshot of cart items at time of purchase
//     total:         cartTotal,        // total price
//     currency,                        // selected currency (e.g. 'GHS')
//     status,
//     date:          new Date().toISOString().split('T')[0], // today's date "2026-02-17"
//     customerName:  checkoutForm.name,
//     customerEmail: checkoutForm.email,
//   });

//   // validateForm — checks required fields before allowing payment
//   // returns true if valid, false if not (and shows a toast error)
//   const validateForm = () => {
//     if (!checkoutForm.name || !checkoutForm.email) {
//       toast.error('Please fill in your name and email');
//       return false;
//     }
//     return true;
//   };


//   // ── PAYMENT HANDLERS ───────────────────────────────────────────────────────
//   // Each handler:
//   //   1. Validates the form
//   //   2. Generates a unique order ID
//   //   3. Calls the matching Firebase Cloud Function
//   //   4. Saves the order to our store
//   //   5. Redirects the user to the payment page
//   //   6. Handles errors if anything goes wrong
//   //
//   // httpsCallable(functions, 'functionName') creates a reference to a function
//   // deployed in functions/index.js on Google's servers.
//   // Calling it like result = await fn(data) sends data and waits for the response.
//   // CONNECTS TO → functions/index.js


//   // Handler 1: Paystack
//   // Best for: NGN (Nigeria), GHS (Ghana), KES (Kenya), ZAR (South Africa)
//   // CONNECTS TO → functions/index.js → exports.initializePaystack
//   const handlePaystack = async () => {
//     if (!validateForm()) return; // stop if form is incomplete

//     setIsCheckingOut(true);  // show loading state on buttons
//     setPaymentError('');     // clear any previous error

//     // Generate unique order ID using current timestamp in base-36 (shorter string)
//     const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

//     try {
//       // Create a callable reference to our initializePaystack Firebase Function
//       const initializePaystack = httpsCallable(functions, 'initializePaystack');

//       // Call the function — this sends data to Google's servers
//       // The function talks to Paystack's API and returns a payment URL
//       const result = await initializePaystack({
//         email:        checkoutForm.email,
//         amount:       cartTotal,           // e.g. 149.97
//         orderId,                           // e.g. "ORD-K3X9P"
//         cartItems:    state.cart,          // array of cart items
//         customerName: checkoutForm.name,
//         currency,                          // e.g. "GHS"
//         // After payment, Paystack redirects user back to this URL
//         callbackUrl: `${window.location.origin}?payment=success&provider=paystack&ref=${orderId}`,
//       });

//       // result.data is what functions/index.js returns:
//       // { success: true, authorization_url: "https://paystack.com/pay/...", ... }
//       const { authorization_url } = result.data;

//       // Save order to our store as 'pending' (will become 'paid' after redirect)
//       dispatch({ type: 'ADD_ORDER', order: createOrder(orderId) });

//       toast.success('Redirecting to Paystack...');

//       // Redirect user to Paystack's hosted payment page
//       window.location.href = authorization_url;

//     } catch (err) {
//       console.error('Paystack error:', err);
//       setPaymentError(err.message || 'Paystack payment failed. Please try again.');
//       toast.error('Paystack initialization failed');
//     } finally {
//       // Always runs — hide loading state whether success or error
//       setIsCheckingOut(false);
//     }
//   };


//   // Handler 2: Stripe
//   // Best for: USD, GBP, EUR and 135+ global currencies
//   // CONNECTS TO → functions/index.js → exports.initializeStripe
//   const handleStripe = async () => {
//     if (!validateForm()) return;

//     setIsCheckingOut(true);
//     setPaymentError('');

//     const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

//     try {
//       const initializeStripe = httpsCallable(functions, 'initializeStripe');

//       const result = await initializeStripe({
//         email:        checkoutForm.email,
//         amount:       cartTotal,
//         orderId,
//         cartItems:    state.cart,
//         customerName: checkoutForm.name,
//         currency,
//         successUrl:   window.location.origin, // where Stripe redirects after success
//         cancelUrl:    window.location.href,   // where Stripe redirects if user cancels
//       });

//       // result.data from Stripe function:
//       // { success: true, sessionUrl: "https://checkout.stripe.com/...", sessionId: "..." }
//       const { sessionUrl } = result.data;

//       dispatch({ type: 'ADD_ORDER', order: createOrder(orderId) });
//       toast.success('Redirecting to Stripe...');
//       window.location.href = sessionUrl;

//     } catch (err) {
//       console.error('Stripe error:', err);
//       setPaymentError(err.message || 'Stripe payment failed. Please try again.');
//       toast.error('Stripe initialization failed');
//     } finally {
//       setIsCheckingOut(false);
//     }
//   };


//   // Handler 3: Flutterwave
//   // Best for: Pan-Africa (NGN, GHS, KES, ZAR, TZS, UGX) + USD, GBP, EUR
//   // CONNECTS TO → functions/index.js → exports.initializeFlutterwave
//   const handleFlutterwave = async () => {
//     if (!validateForm()) return;

//     setIsCheckingOut(true);
//     setPaymentError('');

//     const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

//     try {
//       const initializeFlutterwave = httpsCallable(functions, 'initializeFlutterwave');

//       const result = await initializeFlutterwave({
//         email:         checkoutForm.email,
//         amount:        cartTotal,
//         orderId,
//         cartItems:     state.cart,
//         customerName:  checkoutForm.name,
//         customerPhone: checkoutForm.phone,  // Flutterwave can use phone number too
//         currency,
//         redirectUrl: `${window.location.origin}?payment=success&provider=flutterwave&ref=${orderId}`,
//       });

//       // result.data from Flutterwave function:
//       // { success: true, paymentUrl: "https://ravemodal-dev.herokuapp.com/...", ... }
//       const { paymentUrl } = result.data;

//       dispatch({ type: 'ADD_ORDER', order: createOrder(orderId) });
//       toast.success('Redirecting to Flutterwave...');
//       window.location.href = paymentUrl;

//     } catch (err) {
//       console.error('Flutterwave error:', err);
//       setPaymentError(err.message || 'Flutterwave payment failed. Please try again.');
//       toast.error('Flutterwave initialization failed');
//     } finally {
//       setIsCheckingOut(false);
//     }
//   };


//   // ── DERIVED VALUES ─────────────────────────────────────────────────────────

//   // Find the full currency object for the currently selected currency code
//   // e.g. if currency is 'GHS', selectedCurrency is { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', ... }
//   // CONNECTS TO → src/utils/currency.js → CURRENCIES array
//   const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];


//   // ── RENDER ─────────────────────────────────────────────────────────────────
//   return (

//     // Outer container — covers the full screen with a dark overlay behind the drawer
//     <div className="fixed inset-0 z-50 flex justify-end">

//       {/* Dark backdrop — clicking it closes the cart by dispatching TOGGLE_CART */}
//       <div
//         className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//         onClick={() => dispatch({ type: 'TOGGLE_CART' })}
//       />

//       {/* The actual drawer panel — slides in from the right */}
//       <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-black border-l border-white/10 shadow-2xl flex flex-col h-full">

//         {/* ── HEADER ── */}
//         <div className="flex items-center justify-between p-6 border-b border-white/10">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center">
//               <ShoppingBag className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h2 className="text-lg font-bold text-white">Shopping Cart</h2>
//               {/* cartCount comes from useStore — updates automatically when items change */}
//               <p className="text-sm text-white/40">{cartCount} items</p>
//             </div>
//           </div>

//           {/* Close button — dispatches TOGGLE_CART to hide the drawer */}
//           <button
//             onClick={() => dispatch({ type: 'TOGGLE_CART' })}
//             className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>


//         {/* ── CART ITEMS LIST ── */}
//         {/* flex-1 makes this section take up all available space, overflow-y-auto adds scroll */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-4">
//           {state.cart.length === 0 ? (

//             // Empty state
//             <div className="text-center py-16">
//               <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-white/40 mb-2">Your cart is empty</h3>
//               <p className="text-sm text-white/30 mb-6">Add some products to get started</p>
//               <button
//                 onClick={() => dispatch({ type: 'TOGGLE_CART' })}
//                 className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl text-white font-medium hover:from-pink-600 hover:to-red-600 transition-all"
//               >
//                 Continue Shopping
//               </button>
//             </div>

//           ) : (

//             // Map over cart items — each item has item.product and item.quantity
//             state.cart.map((item) => (
//               <div
//                 key={item.product.id} // React needs a unique key for list items
//                 className="flex gap-4 p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:border-white/10 transition-all"
//               >
//                 <img
//                   src={item.product.image}
//                   alt={item.product.name}
//                   className="w-20 h-20 object-cover rounded-lg"
//                 />
//                 <div className="flex-1 min-w-0">
//                   <h4 className="text-sm font-semibold text-white truncate">{item.product.name}</h4>

//                   {/* formatAmount formats the price with the correct currency symbol */}
//                   {/* CONNECTS TO → src/utils/currency.js → formatAmount() */}
//                   <p className="text-sm text-pink-400 font-medium mt-1">
//                     {formatAmount(item.product.price, currency)}
//                   </p>

//                   <div className="flex items-center gap-2 mt-2">

//                     {/* Decrease quantity button */}
//                     <button
//                       onClick={() => dispatch({
//                         type:      'UPDATE_QUANTITY',
//                         productId: item.product.id,
//                         quantity:  item.quantity - 1,
//                       })}
//                       className="p-1 rounded-md bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
//                     >
//                       <Minus className="w-3 h-3" />
//                     </button>

//                     {/* Current quantity */}
//                     <span className="text-sm text-white font-medium min-w-[20px] text-center">
//                       {item.quantity}
//                     </span>

//                     {/* Increase quantity button */}
//                     <button
//                       onClick={() => dispatch({
//                         type:      'UPDATE_QUANTITY',
//                         productId: item.product.id,
//                         quantity:  item.quantity + 1,
//                       })}
//                       className="p-1 rounded-md bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
//                     >
//                       <Plus className="w-3 h-3" />
//                     </button>

//                     {/* Remove item button */}
//                     <button
//                       onClick={() => dispatch({
//                         type:      'REMOVE_FROM_CART',
//                         productId: item.product.id,
//                       })}
//                       className="ml-auto p-1.5 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>


//         {/* ── CHECKOUT SECTION — only renders when cart has items ── */}
//         {state.cart.length > 0 && (
//           <div className="p-6 border-t border-white/10 space-y-4">

//             {/* ── CURRENCY SELECTOR ── */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowCurrencyPicker((v) => !v)}
//                 className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm hover:bg-white/10 transition-all w-full justify-between"
//               >
//                 <span>{selectedCurrency.symbol} {selectedCurrency.code} — {selectedCurrency.name}</span>
//                 {/* Arrow rotates when dropdown is open */}
//                 <ChevronDown className={`w-4 h-4 transition-transform ${showCurrencyPicker ? 'rotate-180' : ''}`} />
//               </button>

//               {/* Currency dropdown list */}
//               {showCurrencyPicker && (
//                 <div className="absolute bottom-full mb-1 left-0 right-0 bg-gray-900 border border-white/10 rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
//                   {CURRENCIES.map((c) => (
//                     <button
//                       key={c.code}
//                       onClick={() => { setCurrency(c.code); setShowCurrencyPicker(false); }}
//                       className={`w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-white/10 ${
//                         currency === c.code ? 'text-white bg-white/5' : 'text-white/60'
//                       }`}
//                     >
//                       {c.symbol} {c.code} — {c.name}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>


//             {/* ── CHECKOUT FORM + PAYMENT BUTTONS ── */}
//             {showCheckout ? (
//               <div className="space-y-3">

//                 {/* Name input */}
//                 <input
//                   type="text"
//                   placeholder="Full Name"
//                   value={checkoutForm.name}
//                   onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50"
//                 />

//                 {/* Email input */}
//                 <input
//                   type="email"
//                   placeholder="Email Address"
//                   value={checkoutForm.email}
//                   onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50"
//                 />

//                 {/* Phone input — optional, used by Flutterwave */}
//                 <input
//                   type="tel"
//                   placeholder="Phone Number (optional)"
//                   value={checkoutForm.phone}
//                   onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50"
//                 />

//                 {/* Payment error message — only shows when there's an error */}
//                 {paymentError && (
//                   <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>{paymentError}</span>
//                   </div>
//                 )}

//                 {/* Order total */}
//                 <div className="flex items-center justify-between pt-1">
//                   <span className="text-white/50 text-sm">Total</span>
//                   <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
//                     {formatAmount(cartTotal, currency)}
//                   </span>
//                 </div>

//                 {/* ── 3 PAYMENT BUTTONS ── */}
//                 <p className="text-xs text-white/40 text-center">Choose your payment method</p>

//                 {/* Object.entries(PROVIDERS) turns the object into an array we can map over */}
//                 {/* Each iteration gives us [key, provider] e.g. ['stripe', { label: 'Stripe', ... }] */}
//                 {Object.entries(PROVIDERS).map(([key, provider]) => (
//                   <button
//                     key={key}
//                     onClick={() => {
//                       if (key === 'paystack')    handlePaystack();
//                       if (key === 'stripe')      handleStripe();
//                       if (key === 'flutterwave') handleFlutterwave();
//                     }}
//                     disabled={isCheckingOut} // disable all buttons while processing
//                     className={`w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r ${provider.color} rounded-xl text-white font-semibold transition-all shadow-lg ${provider.shadow} hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed`}
//                   >
//                     {isCheckingOut ? (
//                       <>
//                         <Loader2 className="w-4 h-4 animate-spin" />
//                         <span>Processing...</span>
//                       </>
//                     ) : (
//                       <>
//                         <span>{provider.logo}</span>
//                         <span>Pay with {provider.label}</span>
//                       </>
//                     )}
//                   </button>
//                 ))}

//                 {/* Back button */}
//                 <button
//                   onClick={() => { setShowCheckout(false); setPaymentError(''); }}
//                   className="w-full py-3 text-sm text-white/50 hover:text-white transition-all"
//                 >
//                   ← Back to Cart
//                 </button>
//               </div>

//             ) : (

//               // ── ORDER SUMMARY (before clicking Checkout) ──
//               <>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-white/50">Subtotal</span>
//                   <span className="text-white">{formatAmount(cartTotal, currency)}</span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-white/50">Shipping</span>
//                   <span className="text-green-400">Free</span>
//                 </div>
//                 <div className="h-px bg-white/10" />
//                 <div className="flex items-center justify-between">
//                   <span className="text-white font-semibold">Total</span>
//                   <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
//                     {formatAmount(cartTotal, currency)}
//                   </span>
//                 </div>

//                 {/* Checkout button — clicking this reveals the form + payment buttons */}
//                 <button
//                   onClick={() => setShowCheckout(true)}
//                   className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 rounded-xl text-white font-semibold hover:from-pink-600 hover:via-red-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
//                 >
//                   <CreditCard className="w-5 h-5" />
//                   <span>Checkout — {formatAmount(cartTotal, currency)}</span>
//                 </button>
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CartDrawer;


/**
 * CartDrawer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the sliding cart panel that appears on the right side of the screen.
 * It handles:
 *   1. Displaying cart items
 *   2. Currency selection (auto-detected from user's browser location)
 *   3. Checkout form (name, email, phone)
 *   4. Payment buttons (Paystack, Stripe, Flutterwave)
 *
 * CONNECTIONS:
 *   → src/firebase/firebase.js     (Firebase app + functions connection)
 *   → src/utils/currency.js        (currency detection + formatting)
 *   → src/store/useStore.js        (global cart state)
 *   → functions/index.js           (Firebase Cloud Functions on Google's servers)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── IMPORTS ─────────────────────────────────────────────────────────────────

// React core — useState manages local state, useEffect runs code on mount
import React, { useState, useEffect } from 'react';

// Icons from lucide-react icon library
// Each one is a small SVG component used in the UI
import {
  X,             // ✕ close button
  Minus,         // − decrease quantity button
  Plus,          // + increase quantity button
  Trash2,        // 🗑 remove item button
  ShoppingBag,   // 🛍 cart icon in header + empty state
  CreditCard,    // 💳 checkout button icon
  Loader2,       // ⟳ spinning loading icon during payment
  AlertCircle,   // ⚠ error message icon
  ChevronDown,   // ˅ dropdown arrow for currency picker
} from 'lucide-react';

// httpsCallable — this is how we call our Firebase Cloud Functions from React.
// Instead of fetch() or axios, Firebase handles the network request,
// authentication headers, and CORS automatically.
// CONNECTS TO → src/firebase/firebase.js → functions/index.js
import { httpsCallable } from 'firebase/functions';

// functions — the Firebase Functions instance we initialized in firebase.js
// This tells httpsCallable which Firebase project to talk to
// CONNECTS TO → src/firebase/firebase.js
import { functions } from '@/firebase/firebase';

// useStore — our global state manager (Zustand or Context)
// Gives us: state (cart items, isCartOpen), dispatch (actions), cartTotal, cartCount
// CONNECTS TO → src/store/useStore.js
import { useStore } from '@/store/useStore';

// toast — shows small popup notification messages (success, error)
// e.g. "Redirecting to Stripe..." or "Payment failed"
import { toast } from 'sonner';

// Currency utilities — all currency-related logic is in one place
// CONNECTS TO → src/lib/currency.js
import {
  CURRENCIES,        // array of all supported currencies with symbols and provider info
  detectCurrency,    // detects user's currency from their browser locale
  formatAmount,      // formats a number like 49.99 → "$49.99" or "GH₵49.99"
} from '@/lib/currency';

// ContactButtons — WhatsApp + Instagram buttons for reaching the admin
// CONNECTS TO → src/components/ui/ContactButtons.jsx → src/lib/adminContact.js
import ContactButtons from '@/components/ui/ContactButtons';


// ─── PAYMENT PROVIDER CONFIG ──────────────────────────────────────────────────
// This object defines how each payment button looks in the UI.
// label   → button text
// color   → Tailwind gradient classes for the button background
// shadow  → Tailwind shadow color class
// logo    → emoji used as a quick icon (swap for <img> if you have real logos)

const PROVIDERS = {
  paystack: {
    label:  'Paystack',
    color:  'from-[#00C3F7] to-[#0193D7]',   // blue gradient (Paystack brand color)
    shadow: 'shadow-[#00C3F7]/25',
    logo:   '🇳🇬',
  },
  stripe: {
    label:  'Stripe',
    color:  'from-[#6772E5] to-[#4F56C8]',   // purple gradient (Stripe brand color)
    shadow: 'shadow-[#6772E5]/25',
    logo:   '💳',
  },
  flutterwave: {
    label:  'Flutterwave',
    color:  'from-[#F5A623] to-[#E8890C]',   // orange gradient (Flutterwave brand color)
    shadow: 'shadow-[#F5A623]/25',
    logo:   '🌍',
  },
};


// ─── COMPONENT ───────────────────────────────────────────────────────────────
const CartDrawer = () => {

  // ── GLOBAL STATE (from our store) ──────────────────────────────────────────
  // state        → contains state.cart (array of items) and state.isCartOpen (boolean)
  // dispatch     → function to send actions like ADD_ORDER, CLEAR_CART, TOGGLE_CART
  // cartTotal    → computed total price of all items in cart (e.g. 149.97)
  // cartCount    → total number of items in cart (e.g. 3)
  // CONNECTS TO → src/store/useStore.js
  const { state, dispatch, cartTotal, cartCount } = useStore();


  // ── LOCAL STATE ────────────────────────────────────────────────────────────
  // These only exist inside this component

  // true while waiting for payment provider to respond — disables buttons
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // the 3 form fields the user fills in before paying
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '' });

  // toggles between showing the order summary vs the checkout form + payment buttons
  const [showCheckout, setShowCheckout] = useState(false);

  // stores any payment error message to show in the UI (e.g. "Card declined")
  const [paymentError, setPaymentError] = useState('');

  // the currently selected currency code (e.g. 'USD', 'GHS', 'GBP')
  // starts as 'USD' then gets auto-detected in useEffect below
  const [currency, setCurrency] = useState('USD');

  // controls whether the currency dropdown list is visible or hidden
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);


  // ── EFFECTS ────────────────────────────────────────────────────────────────
  // useEffect with [] runs ONCE when the component first mounts (like componentDidMount)
  // Both effects must be here ABOVE the early return — this is the Rules of Hooks fix

  // Effect 1: Auto-detect the user's currency from their browser locale
  // e.g. a user in Ghana gets GHS, a user in UK gets GBP
  // CONNECTS TO → src/utils/currency.js → detectCurrency()
  useEffect(() => {
    const detected = detectCurrency(); // returns a currency code like 'GHS'
    setCurrency(detected);             // updates the currency state
  }, []); // [] means run once on mount, never again


  // Effect 2: Handle payment redirect callbacks
  // When Paystack or Flutterwave redirect the user back to our app after payment,
  // they add ?payment=success&provider=paystack&ref=ORD-ABC to the URL.
  // This effect checks for that and marks the order as paid.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search); // parse URL query params

    if (params.get('payment') === 'success') {         // if payment was successful
      const ref      = params.get('ref');              // get order ID from URL
      const provider = params.get('provider') || 'unknown'; // get provider name from URL

      if (ref) {
        // Mark the order as paid in our global store
        dispatch({ type: 'UPDATE_ORDER_STATUS', orderId: ref, status: 'paid' });

        // Clear the cart since order is complete
        dispatch({ type: 'CLEAR_CART' });

        // Show success notification
        toast.success(`Payment confirmed via ${PROVIDERS[provider]?.label || provider}! Order ${ref} is now paid.`);

        // Clean up the URL — remove the ?payment=success part so it doesn't trigger again on refresh
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []); // [] means run once on mount


  // ── EARLY RETURN ───────────────────────────────────────────────────────────
  // If the cart is closed, render nothing at all.
  // This MUST come after all hooks above — React requires hooks to always run
  // in the same order, so no hooks can come after this line.
  if (!state.isCartOpen) return null;


  // ── HELPER FUNCTIONS ───────────────────────────────────────────────────────

  // createOrder — builds a standard order object used by all 3 payment handlers
  // orderId  → unique order ID generated in each handler (e.g. "ORD-K3X9P")
  // status   → 'pending' by default, becomes 'paid' after payment confirmation
  const createOrder = (orderId, status = 'pending') => ({
    id:            orderId,
    items:         state.cart,       // snapshot of cart items at time of purchase
    total:         cartTotal,        // total price
    currency,                        // selected currency (e.g. 'GHS')
    status,
    date:          new Date().toISOString().split('T')[0], // today's date "2026-02-17"
    customerName:  checkoutForm.name,
    customerEmail: checkoutForm.email,
  });

  // validateForm — checks required fields before allowing payment
  // returns true if valid, false if not (and shows a toast error)
  const validateForm = () => {
    if (!checkoutForm.name || !checkoutForm.email) {
      toast.error('Please fill in your name and email');
      return false;
    }
    return true;
  };


  // ── PAYMENT HANDLERS ───────────────────────────────────────────────────────
  // Each handler:
  //   1. Validates the form
  //   2. Generates a unique order ID
  //   3. Calls the matching Firebase Cloud Function
  //   4. Saves the order to our store
  //   5. Redirects the user to the payment page
  //   6. Handles errors if anything goes wrong
  //
  // httpsCallable(functions, 'functionName') creates a reference to a function
  // deployed in functions/index.js on Google's servers.
  // Calling it like result = await fn(data) sends data and waits for the response.
  // CONNECTS TO → functions/index.js


  // Handler 1: Paystack
  // Best for: NGN (Nigeria), GHS (Ghana), KES (Kenya), ZAR (South Africa)
  // CONNECTS TO → functions/index.js → exports.initializePaystack
  const handlePaystack = async () => {
    if (!validateForm()) return; // stop if form is incomplete

    setIsCheckingOut(true);  // show loading state on buttons
    setPaymentError('');     // clear any previous error

    // Generate unique order ID using current timestamp in base-36 (shorter string)
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    try {
      // Create a callable reference to our initializePaystack Firebase Function
      const initializePaystack = httpsCallable(functions, 'initializePaystack');

      // Call the function — this sends data to Google's servers
      // The function talks to Paystack's API and returns a payment URL
      const result = await initializePaystack({
        email:        checkoutForm.email,
        amount:       cartTotal,           // e.g. 149.97
        orderId,                           // e.g. "ORD-K3X9P"
        cartItems:    state.cart,          // array of cart items
        customerName: checkoutForm.name,
        currency,                          // e.g. "GHS"
        // After payment, Paystack redirects user back to this URL
        callbackUrl: `${window.location.origin}?payment=success&provider=paystack&ref=${orderId}`,
      });

      // result.data is what functions/index.js returns:
      // { success: true, authorization_url: "https://paystack.com/pay/...", ... }
      const { authorization_url } = result.data;

      // Save order to our store as 'pending' (will become 'paid' after redirect)
      dispatch({ type: 'ADD_ORDER', order: createOrder(orderId) });

      toast.success('Redirecting to Paystack...');

      // Redirect user to Paystack's hosted payment page
      window.location.href = authorization_url;

    } catch (err) {
      console.error('Paystack error:', err);
      setPaymentError(err.message || 'Paystack payment failed. Please try again.');
      toast.error('Paystack initialization failed');
    } finally {
      // Always runs — hide loading state whether success or error
      setIsCheckingOut(false);
    }
  };


  // Handler 2: Stripe
  // Best for: USD, GBP, EUR and 135+ global currencies
  // CONNECTS TO → functions/index.js → exports.initializeStripe
  const handleStripe = async () => {
    if (!validateForm()) return;

    setIsCheckingOut(true);
    setPaymentError('');

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    try {
      const initializeStripe = httpsCallable(functions, 'initializeStripe');

      const result = await initializeStripe({
        email:        checkoutForm.email,
        amount:       cartTotal,
        orderId,
        cartItems:    state.cart,
        customerName: checkoutForm.name,
        currency,
        successUrl:   window.location.origin, // where Stripe redirects after success
        cancelUrl:    window.location.href,   // where Stripe redirects if user cancels
      });

      // result.data from Stripe function:
      // { success: true, sessionUrl: "https://checkout.stripe.com/...", sessionId: "..." }
      const { sessionUrl } = result.data;

      dispatch({ type: 'ADD_ORDER', order: createOrder(orderId) });
      toast.success('Redirecting to Stripe...');
      window.location.href = sessionUrl;

    } catch (err) {
      console.error('Stripe error:', err);
      setPaymentError(err.message || 'Stripe payment failed. Please try again.');
      toast.error('Stripe initialization failed');
    } finally {
      setIsCheckingOut(false);
    }
  };


  // Handler 3: Flutterwave
  // Best for: Pan-Africa (NGN, GHS, KES, ZAR, TZS, UGX) + USD, GBP, EUR
  // CONNECTS TO → functions/index.js → exports.initializeFlutterwave
  const handleFlutterwave = async () => {
    if (!validateForm()) return;

    setIsCheckingOut(true);
    setPaymentError('');

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    try {
      const initializeFlutterwave = httpsCallable(functions, 'initializeFlutterwave');

      const result = await initializeFlutterwave({
        email:         checkoutForm.email,
        amount:        cartTotal,
        orderId,
        cartItems:     state.cart,
        customerName:  checkoutForm.name,
        customerPhone: checkoutForm.phone,  // Flutterwave can use phone number too
        currency,
        redirectUrl: `${window.location.origin}?payment=success&provider=flutterwave&ref=${orderId}`,
      });

      // result.data from Flutterwave function:
      // { success: true, paymentUrl: "https://ravemodal-dev.herokuapp.com/...", ... }
      const { paymentUrl } = result.data;

      dispatch({ type: 'ADD_ORDER', order: createOrder(orderId) });
      toast.success('Redirecting to Flutterwave...');
      window.location.href = paymentUrl;

    } catch (err) {
      console.error('Flutterwave error:', err);
      setPaymentError(err.message || 'Flutterwave payment failed. Please try again.');
      toast.error('Flutterwave initialization failed');
    } finally {
      setIsCheckingOut(false);
    }
  };


  // ── DERIVED VALUES ─────────────────────────────────────────────────────────

  // Find the full currency object for the currently selected currency code
  // e.g. if currency is 'GHS', selectedCurrency is { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', ... }
  // CONNECTS TO → src/utils/currency.js → CURRENCIES array
  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];


  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (

    // Outer container — covers the full screen with a dark overlay behind the drawer
    <div className="fixed inset-0 z-50 flex justify-end">

      {/* Dark backdrop — clicking it closes the cart by dispatching TOGGLE_CART */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
      />

      {/* The actual drawer panel — slides in from the right */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-black border-l border-white/10 shadow-2xl flex flex-col h-full">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Shopping Cart</h2>
              {/* cartCount comes from useStore — updates automatically when items change */}
              <p className="text-sm text-white/40">{cartCount} items</p>
            </div>
          </div>

          {/* Close button — dispatches TOGGLE_CART to hide the drawer */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* ── CART ITEMS LIST ── */}
        {/* flex-1 makes this section take up all available space, overflow-y-auto adds scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {state.cart.length === 0 ? (

            // Empty state
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/40 mb-2">Your cart is empty</h3>
              <p className="text-sm text-white/30 mb-6">Add some products to get started</p>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl text-white font-medium hover:from-pink-600 hover:to-red-600 transition-all"
              >
                Continue Shopping
              </button>
            </div>

          ) : (

            // Map over cart items — each item has item.product and item.quantity
            state.cart.map((item) => (
              <div
                key={item.product.id} // React needs a unique key for list items
                className="flex gap-4 p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{item.product.name}</h4>

                  {/* formatAmount formats the price with the correct currency symbol */}
                  {/* CONNECTS TO → src/utils/currency.js → formatAmount() */}
                  <p className="text-sm text-pink-400 font-medium mt-1">
                    {formatAmount(item.product.price, currency)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">

                    {/* Decrease quantity button */}
                    <button
                      onClick={() => dispatch({
                        type:      'UPDATE_QUANTITY',
                        productId: item.product.id,
                        quantity:  item.quantity - 1,
                      })}
                      className="p-1 rounded-md bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    {/* Current quantity */}
                    <span className="text-sm text-white font-medium min-w-[20px] text-center">
                      {item.quantity}
                    </span>

                    {/* Increase quantity button */}
                    <button
                      onClick={() => dispatch({
                        type:      'UPDATE_QUANTITY',
                        productId: item.product.id,
                        quantity:  item.quantity + 1,
                      })}
                      className="p-1 rounded-md bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    {/* Remove item button */}
                    <button
                      onClick={() => dispatch({
                        type:      'REMOVE_FROM_CART',
                        productId: item.product.id,
                      })}
                      className="ml-auto p-1.5 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>


        {/* ── CHECKOUT SECTION — only renders when cart has items ── */}
        {state.cart.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">

            {/* ── CURRENCY SELECTOR ── */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyPicker((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm hover:bg-white/10 transition-all w-full justify-between"
              >
                <span>{selectedCurrency.symbol} {selectedCurrency.code} — {selectedCurrency.name}</span>
                {/* Arrow rotates when dropdown is open */}
                <ChevronDown className={`w-4 h-4 transition-transform ${showCurrencyPicker ? 'rotate-180' : ''}`} />
              </button>

              {/* Currency dropdown list */}
              {showCurrencyPicker && (
                <div className="absolute bottom-full mb-1 left-0 right-0 bg-gray-900 border border-white/10 rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setShowCurrencyPicker(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-white/10 ${
                        currency === c.code ? 'text-white bg-white/5' : 'text-white/60'
                      }`}
                    >
                      {c.symbol} {c.code} — {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* ── CHECKOUT FORM + PAYMENT BUTTONS ── */}
            {showCheckout ? (
              <div className="space-y-3">

                {/* Name input */}
                <input
                  type="text"
                  placeholder="Full Name"
                  value={checkoutForm.name}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50"
                />

                {/* Email input */}
                <input
                  type="email"
                  placeholder="Email Address"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50"
                />

                {/* Phone input — optional, used by Flutterwave */}
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50"
                />

                {/* Payment error message — only shows when there's an error */}
                {paymentError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Order total */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-white/50 text-sm">Total</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                    {formatAmount(cartTotal, currency)}
                  </span>
                </div>

                {/* ── 3 PAYMENT BUTTONS ── */}
                <p className="text-xs text-white/40 text-center">Choose your payment method</p>

                {/* Object.entries(PROVIDERS) turns the object into an array we can map over */}
                {/* Each iteration gives us [key, provider] e.g. ['stripe', { label: 'Stripe', ... }] */}
                {Object.entries(PROVIDERS).map(([key, provider]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'paystack')    handlePaystack();
                      if (key === 'stripe')      handleStripe();
                      if (key === 'flutterwave') handleFlutterwave();
                    }}
                    disabled={isCheckingOut} // disable all buttons while processing
                    className={`w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r ${provider.color} rounded-xl text-white font-semibold transition-all shadow-lg ${provider.shadow} hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{provider.logo}</span>
                        <span>Pay with {provider.label}</span>
                      </>
                    )}
                  </button>
                ))}

                {/* Back button */}
                <button
                  onClick={() => { setShowCheckout(false); setPaymentError(''); }}
                  className="w-full py-3 text-sm text-white/50 hover:text-white transition-all"
                >
                  ← Back to Cart
                </button>
              </div>

            ) : (

              // ── ORDER SUMMARY (before clicking Checkout) ──
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-white">{formatAmount(cartTotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                    {formatAmount(cartTotal, currency)}
                  </span>
                </div>

                {/* Checkout button — clicking this reveals the form + payment buttons */}
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 rounded-xl text-white font-semibold hover:from-pink-600 hover:via-red-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Checkout — {formatAmount(cartTotal, currency)}</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-white/30 text-xs">or contact admin</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                {/* WhatsApp + Instagram buttons */}
                {/* WhatsApp auto-fills full order summary, Instagram opens admin profile */}
                <ContactButtons
                  cartItems={state.cart}
                  cartTotal={cartTotal}
                  currency={currency}
                  size="sm"
                  layout="row"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;