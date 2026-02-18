/**
 * functions/index.js
 * Firebase Cloud Functions for Paystack, Stripe, and Flutterwave payment initialization.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret }       = require('firebase-functions/params');
const admin                  = require('firebase-admin');
const axios                  = require('axios');
const Stripe                 = require('stripe');

admin.initializeApp();

const PAYSTACK_SECRET_KEY    = defineSecret('PAYSTACK_SECRET_KEY');
const STRIPE_SECRET_KEY      = defineSecret('STRIPE_SECRET_KEY');
const FLUTTERWAVE_SECRET_KEY = defineSecret('FLUTTERWAVE_SECRET_KEY');

const callableConfig = {
  cors: ['http://localhost:5174', 'http://localhost:5173', 'https://your-production-domain.com'],
};

const PAYSTACK_CURRENCIES = ['NGN', 'GHS', 'ZAR', 'KES'];

// --- PAYSTACK ---
exports.initializePaystack = onCall(
  { secrets: [PAYSTACK_SECRET_KEY], ...callableConfig },
  async (request) => {
    const { email, amount, orderId, cartItems, customerName, currency = 'NGN', callbackUrl } = request.data;

    if (!email || !amount || !orderId) {
      throw new HttpsError('invalid-argument', 'email, amount, and orderId are required');
    }
    if (!PAYSTACK_CURRENCIES.includes(currency.toUpperCase())) {
      throw new HttpsError('invalid-argument', `Paystack does not support ${currency}. Supported: ${PAYSTACK_CURRENCIES.join(', ')}`);
    }

    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount:       Math.round(amount * 100),
          currency:     currency.toUpperCase(),
          reference:    orderId,
          callback_url: callbackUrl,
          metadata: { orderId, customerName, cartItems: JSON.stringify(cartItems) },
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY.value()}`, 'Content-Type': 'application/json' } }
      );

      const { data } = response.data;
      return { success: true, authorization_url: data.authorization_url, reference: data.reference, provider: 'paystack' };
    } catch (err) {
      console.error('Paystack error:', err.response?.data || err.message);
      throw new HttpsError('internal', err.response?.data?.message || 'Paystack initialization failed');
    }
  }
);

// --- STRIPE ---
exports.initializeStripe = onCall(
  { secrets: [STRIPE_SECRET_KEY], ...callableConfig },
  async (request) => {
    const { email, amount, orderId, cartItems, customerName, currency = 'usd', successUrl, cancelUrl } = request.data;

    if (!email || !amount || !orderId || !successUrl) {
      throw new HttpsError('invalid-argument', 'email, amount, orderId, and successUrl are required');
    }

    try {
      const stripe  = new Stripe(STRIPE_SECRET_KEY.value());
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode:                 'payment',
        customer_email:       email,
        line_items: [{
          price_data: {
            currency:     currency.toLowerCase(),
            unit_amount:  Math.round(amount * 100),
            product_data: { name: `Order ${orderId}`, description: `${cartItems?.length || 0} item(s)` },
          },
          quantity: 1,
        }],
        metadata: { orderId, customerName, cartItems: JSON.stringify(cartItems?.slice(0, 5)) },
        success_url: `${successUrl}?payment=success&provider=stripe&ref=${orderId}`,
        cancel_url:  cancelUrl || successUrl,
      });

      return { success: true, sessionUrl: session.url, sessionId: session.id, provider: 'stripe' };
    } catch (err) {
      console.error('Stripe error:', err.message);
      throw new HttpsError('internal', err.message || 'Stripe initialization failed');
    }
  }
);

// --- FLUTTERWAVE ---
exports.initializeFlutterwave = onCall(
  { secrets: [FLUTTERWAVE_SECRET_KEY], ...callableConfig },
  async (request) => {
    const { email, amount, orderId, cartItems, customerName, customerPhone, currency = 'NGN', redirectUrl } = request.data;

    if (!email || !amount || !orderId) {
      throw new HttpsError('invalid-argument', 'email, amount, and orderId are required');
    }

    try {
      const response = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref:       orderId,
          amount,
          currency:     currency.toUpperCase(),
          redirect_url: redirectUrl || `${process.env.FRONTEND_URL}?payment=success&provider=flutterwave&ref=${orderId}`,
          customer:     { email, name: customerName, phonenumber: customerPhone },
          customizations: { title: 'Checkout', description: `Order ${orderId}` },
          meta: { orderId, cartItems: JSON.stringify(cartItems) },
        },
        { headers: { Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY.value()}`, 'Content-Type': 'application/json' } }
      );

      const { data } = response.data;
      return { success: true, paymentUrl: data.link, provider: 'flutterwave' };
    } catch (err) {
      console.error('Flutterwave error:', err.response?.data || err.message);
      throw new HttpsError('internal', err.response?.data?.message || 'Flutterwave initialization failed');
    }
  }
);