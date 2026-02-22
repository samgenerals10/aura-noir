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

import React, { useState, useEffect } from 'react';
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Loader2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/firebase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import {
  CURRENCIES,
  detectCurrency,
  formatAmount,
} from '@/lib/currency';
import ContactButtons from '@/components/ui/ContactButtons';

// ─── PAYMENT PROVIDER CONFIG ──────────────────────────────────────────────────
const PROVIDERS = {
  paystack: {
    label: 'Paystack',
    color: 'bg-black',
    logo: '🇳🇬',
  },
  stripe: {
    label: 'Stripe',
    color: 'bg-black',
    logo: '💳',
  },
  flutterwave: {
    label: 'Flutterwave',
    color: 'bg-black',
    logo: '🌍',
  },
};

const CartDrawer = () => {
  const { state, dispatch, cartTotal, cartCount } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    const detected = detectCurrency();
    setCurrency(detected);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const ref = params.get('ref');
      const provider = params.get('provider') || 'unknown';
      if (ref) {
        dispatch({ type: 'UPDATE_ORDER_STATUS', orderId: ref, status: 'paid' });
        dispatch({ type: 'CLEAR_CART' });
        toast.success(`Payment confirmed via ${PROVIDERS[provider]?.label || provider}! Order ${ref} is now paid.`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [dispatch]);

  if (!state.isCartOpen) return null;

  const createOrder = (orderId, status = 'pending') => ({
    id: orderId,
    items: state.cart,
    total: cartTotal,
    currency,
    status,
    date: new Date().toISOString().split('T')[0],
    customerName: checkoutForm.name,
    customerEmail: checkoutForm.email,
  });

  const validateForm = () => {
    if (!checkoutForm.name || !checkoutForm.email) {
      toast.error('Please fill in your name and email');
      return false;
    }
    return true;
  };

  const handlePaystack = async () => {
    if (!validateForm()) return;
    setIsCheckingOut(true);
    setPaymentError('');
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    try {
      const initializePaystack = httpsCallable(functions, 'initializePaystack');
      const result = await initializePaystack({
        email: checkoutForm.email,
        amount: cartTotal,
        orderId,
        cartItems: state.cart,
        customerName: checkoutForm.name,
        currency,
        callbackUrl: `${window.location.origin}?payment=success&provider=paystack&ref=${orderId}`,
      });
      const { authorization_url } = result.data;
      dispatch({ type: 'ADD_ORDER', order: createOrder(orderId) });
      toast.success('Redirecting to Paystack...');
      window.location.href = authorization_url;
    } catch (err) {
      console.error('Paystack error:', err);
      setPaymentError(err.message || 'Paystack payment failed. Please try again.');
      toast.error('Paystack initialization failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleStripe = async () => {
    if (!validateForm()) return;
    setIsCheckingOut(true);
    setPaymentError('');
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    try {
      const initializeStripe = httpsCallable(functions, 'initializeStripe');
      const result = await initializeStripe({
        email: checkoutForm.email,
        amount: cartTotal,
        orderId,
        cartItems: state.cart,
        customerName: checkoutForm.name,
        currency,
        successUrl: window.location.origin,
        cancelUrl: window.location.href,
      });
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

  const handleFlutterwave = async () => {
    if (!validateForm()) return;
    setIsCheckingOut(true);
    setPaymentError('');
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    try {
      const initializeFlutterwave = httpsCallable(functions, 'initializeFlutterwave');
      const result = await initializeFlutterwave({
        email: checkoutForm.email,
        amount: cartTotal,
        orderId,
        cartItems: state.cart,
        customerName: checkoutForm.name,
        customerPhone: checkoutForm.phone,
        currency,
        redirectUrl: `${window.location.origin}?payment=success&provider=flutterwave&ref=${orderId}`,
      });
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

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
      />
      <div className="relative w-full max-w-md bg-black border-l border-white/10 shadow-2xl flex flex-col h-full text-white">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-gold flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Shopping Cart</h2>
              <p className="text-sm text-white/40">{cartCount} items</p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CART ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {state.cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/40 mb-2">Your cart is empty</h3>
              <p className="text-sm text-white/30 mb-6">Add some products to get started</p>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="px-6 py-3 bg-black rounded-xl text-white font-medium hover:bg-black/90 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            state.cart.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{item.product.name}</h4>
                  <p className="text-sm text-gold font-medium mt-1">
                    {formatAmount(item.product.price, currency)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => dispatch({
                        type: 'UPDATE_QUANTITY',
                        productId: item.product.id,
                        quantity: item.quantity - 1,
                      })}
                      className="p-1 rounded-md bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm text-white font-medium min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => dispatch({
                        type: 'UPDATE_QUANTITY',
                        productId: item.product.id,
                        quantity: item.quantity + 1,
                      })}
                      className="p-1 rounded-md bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => dispatch({
                        type: 'REMOVE_FROM_CART',
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

        {/* CHECKOUT SECTION */}
        {state.cart.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            {/* CURRENCY SELECTOR */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyPicker((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm hover:bg-white/10 transition-all w-full justify-between"
              >
                <span>{selectedCurrency.symbol} {selectedCurrency.code} — {selectedCurrency.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCurrencyPicker ? 'rotate-180' : ''}`} />
              </button>
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

            {/* CHECKOUT FORM + PAYMENT BUTTONS */}
            {showCheckout ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={checkoutForm.name}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-gold/50"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-gold/50"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-gold/50"
                />
                {paymentError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-white/50 text-sm">Total</span>
                  <span className="text-lg font-bold text-gold">
                    {formatAmount(cartTotal, currency)}
                  </span>
                </div>
                <p className="text-xs text-white/40 text-center">Choose your payment method</p>
                {Object.entries(PROVIDERS).map(([key, provider]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'paystack')    handlePaystack();
                      if (key === 'stripe')      handleStripe();
                      if (key === 'flutterwave') handleFlutterwave();
                    }}
                    disabled={isCheckingOut}
                    className={`w-full flex items-center justify-center space-x-2 py-3.5 bg-black rounded-xl text-white font-semibold transition-all hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {isCheckingOut ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
                    ) : (
                      <>{provider.logo}<span>Pay with {provider.label}</span></>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => { setShowCheckout(false); setPaymentError(''); }}
                  className="w-full py-3 text-sm text-white/50 hover:text-white transition-all"
                >
                  ← Back to Cart
                </button>
              </div>
            ) : (
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
                  <span className="text-xl font-bold text-gold">
                    {formatAmount(cartTotal, currency)}
                  </span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-black rounded-xl text-white font-semibold hover:bg-black/90 transition-all"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Checkout — {formatAmount(cartTotal, currency)}</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-white/30 text-xs">or contact admin</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
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