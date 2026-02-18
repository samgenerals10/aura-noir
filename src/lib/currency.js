// utils/currency.js
// Auto-detects user currency from browser locale and maps to the best payment provider.
// Users can always override the detected currency in the checkout UI.

export const CURRENCIES = [
    { code: 'USD', symbol: '$',  name: 'US Dollar',        providers: ['stripe', 'flutterwave'] },
    { code: 'GBP', symbol: '£',  name: 'British Pound',    providers: ['stripe'] },
    { code: 'EUR', symbol: '€',  name: 'Euro',             providers: ['stripe'] },
    { code: 'NGN', symbol: '₦',  name: 'Nigerian Naira',   providers: ['paystack', 'flutterwave'] },
    { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi',  providers: ['paystack', 'flutterwave'] },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', providers: ['paystack', 'flutterwave'] },
    { code: 'ZAR', symbol: 'R',  name: 'South African Rand', providers: ['paystack', 'flutterwave'] },
    { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', providers: ['flutterwave'] },
    { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', providers: ['flutterwave'] },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', providers: ['stripe'] },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', providers: ['stripe'] },
  ];
  
  // Map browser locale → currency code
  const LOCALE_TO_CURRENCY = {
    'en-US': 'USD', 'en-CA': 'CAD', 'en-GB': 'GBP', 'en-AU': 'AUD',
    'en-NG': 'NGN', 'en-GH': 'GHS', 'en-KE': 'KES', 'en-ZA': 'ZAR',
    'en-TZ': 'TZS', 'en-UG': 'UGX',
    'de-DE': 'EUR', 'fr-FR': 'EUR', 'es-ES': 'EUR', 'it-IT': 'EUR',
    'nl-NL': 'EUR', 'pt-PT': 'EUR', 'pl-PL': 'EUR',
  };
  
  /**
   * Detects the user's likely currency from their browser locale.
   * Falls back to USD if the locale isn't in the map.
   */
  export function detectCurrency() {
    const locale = navigator.language || navigator.languages?.[0] || 'en-US';
    return LOCALE_TO_CURRENCY[locale] || 'USD';
  }
  
  /**
   * Returns the best payment provider for a given currency.
   * Prefers Paystack for African currencies, Stripe for Western ones,
   * Flutterwave as a broad fallback.
   */
  export function getDefaultProvider(currencyCode) {
    const currency = CURRENCIES.find((c) => c.code === currencyCode);
    if (!currency) return 'stripe'; // ultimate fallback
    return currency.providers[0];
  }
  
  /**
   * Returns the currency object for a given code, or USD as fallback.
   */
  export function getCurrency(code) {
    return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
  }
  
  /**
   * Formats an amount with the correct symbol and decimal places.
   * Currencies like KES, TZS, UGX don't use decimals.
   */
  const NO_DECIMAL_CURRENCIES = ['KES', 'TZS', 'UGX', 'NGN'];
  
  export function formatAmount(amount, currencyCode) {
    const currency = getCurrency(currencyCode);
    const formatted = NO_DECIMAL_CURRENCIES.includes(currencyCode)
      ? Math.round(amount).toLocaleString()
      : amount.toFixed(2);
    return `${currency.symbol}${formatted}`;
  }