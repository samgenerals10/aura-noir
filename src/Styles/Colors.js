// src/styles/colors.js
// ═════════════════════════════════════════════════════════════════════════════
// AURA NOIR COLOR SYSTEM
// Matte Black + Gold Theme
// ═════════════════════════════════════════════════════════════════════════════

export const COLORS = {
  // Primary Theme Colors
  black: {
    pure: '#000000',
    matte: '#0A0A0A',
    soft: '#1A1A1A',
    medium: '#2A2A2A',
    light: '#3A3A3A',
  },
  
  gold: {
    pure: '#B8860B',      // Deep Gold Foil
    bright: '#FFD700',    // Bright gold
    dark: '#8B6508',      // Deeper gold
    muted: '#9E7E38',     // Muted deep gold
    pale: '#CBB47B',      // Pale deep gold
  },
  
  // Gradients (Removed)
  gradients: {
    primary: '#0A0A0A',
    reverse: '#0A0A0A',
    subtle: '#1A1A1A',
    text: '#D4AF37',
    button: '#000000',
  },
  
  // Brand Colors (keep original)
  brands: {
    whatsapp: '#25D366',
    instagram: '#E4405F', // Solid color for instagram
    paystack: '#00C3F7',
    stripe: '#6772E5',
    flutterwave: '#F5A623',
  },
  
  // UI States
  states: {
    success: '#B8860B',   // Deep gold for success
    error: '#8B0000',     // Dark red
    warning: '#B8960C',   // Dark gold
    info: '#C5A572',      // Muted gold
  },
  
  // Whites/Grays (for text)
  neutral: {
    white: '#FFFFFF',
    offWhite: '#F5F5F5',
    lightGray: '#CCCCCC',
    gray: '#999999',
    darkGray: '#666666',
  },
};

// Tailwind CSS Custom Classes
export const TAILWIND_COLORS = {
  // Backgrounds
  'bg-matte-black': '#0A0A0A',
  'bg-gold': '#B8860B',
  'bg-black-soft': '#1A1A1A',
  
  // Text
  'text-gold': '#B8860B',
  'text-gold-bright': '#FFD700',
  'text-matte-black': '#0A0A0A',
  
  // Borders
  'border-gold': '#B8860B',
  'border-gold-muted': '#C5A572',
  
  // Gradients (use in className) - Updated to solid
  'gradient-primary': 'bg-matte-black',
  'gradient-text': 'text-gold',
  'gradient-button': 'bg-black-pure',
};

// Button Shadows (inner shadow-gold-foil/50 for depth)
export const SHADOWS = {
  buttonInner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)',
  buttonInnerHover: 'inset 0 3px 6px 0 rgba(0, 0, 0, 0.7)',
  cardInner: 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.4)',
  goldGlow: '0 0 20px rgba(184, 134, 11, 0.3)',
  goldGlowHover: '0 0 30px rgba(184, 134, 11, 0.5)',
};

// Border Radius (sharp buttons)
export const RADIUS = {
  none: '0',           // Completely sharp
  minimal: '2px',      // Barely rounded
  slight: '4px',       // Slight rounding (use sparingly)
};