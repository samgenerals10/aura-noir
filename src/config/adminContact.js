// src/lib/adminContact.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for admin contact details.
// Update these values here and they'll update everywhere in the app.
// ─────────────────────────────────────────────────────────────────────────────

export const ADMIN_CONTACT = {
    // WhatsApp number with country code — no spaces, dashes or plus sign
    // +233266417755 → 233266417755
    whatsapp: '233266417755',
  
    // Instagram username without the @ symbol
    instagram: 'sam_generals',
  };
  
  // ─── WHATSAPP URL BUILDER ─────────────────────────────────────────────────────
  // Builds a WhatsApp click-to-chat URL with a pre-filled message.
  // When clicked, opens WhatsApp with the message already typed in the DM.
  //
  // product → single product object { name, price, image }
  // quantity → how many of this product (used on product card/detail page)
  // cartItems → array of cart items (used in cart drawer for full order summary)
  // currency → selected currency code e.g. 'GHS'
  
  export const buildWhatsAppURL = ({ product, quantity, cartItems, cartTotal, currency }) => {
    let message = '';
  
    if (cartItems && cartItems.length > 0) {
      // ── FULL ORDER SUMMARY (from cart drawer) ──
      // Lists every item in the cart with quantity and price
      const itemLines = cartItems
        .map((item) => `  • ${item.product.name} x${item.quantity} @ ${currency} ${item.product.price.toFixed(2)}`)
        .join('\n');
  
      message = `Hello! I'd like to place an order 🛍️
  
  *Order Summary:*
  ${itemLines}
  
  *Total: ${currency} ${cartTotal?.toFixed(2)}*
  
  Please confirm availability and payment details. Thank you!`;
  
    } else if (product) {
      // ── SINGLE PRODUCT ENQUIRY (from product card or detail page) ──
      message = `Hello! I'm interested in this product 👇
  
  *Product:* ${product.name}
  *Price:* ${currency || 'USD'} ${product.price?.toFixed(2)}
  *Quantity:* ${quantity || 1}
  
  Is this available? Please share payment and delivery details. Thank you!`;
    }
  
    // encodeURIComponent converts spaces and special chars to URL-safe format
    return `https://wa.me/${ADMIN_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
  };
  
  // ─── INSTAGRAM URL BUILDER ────────────────────────────────────────────────────
  // Opens the admin's Instagram profile.
  // Note: Instagram does not support pre-filled DM messages via URL —
  // the user will have to type their message manually after opening the profile.
  
  export const buildInstagramURL = () => {
    return `https://instagram.com/${ADMIN_CONTACT.instagram}`;
  };
  