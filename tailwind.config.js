import tailwindAnimate from "tailwindcss-animate";
import tailwindTypography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'matte-black': {
          DEFAULT: '#0A0A0A',
          pure: '#000000',
          soft: '#1A1A1A',
          medium: '#2A2A2A',
          light: '#3A3A3A',
        },
        gold: {
          DEFAULT: '#B8860B',
          bright: '#FFD700',
          dark: '#8B6508',
          muted: '#9E7E38',
          pale: '#CBB47B',
        },
        whatsapp: '#25D366',
        paystack: '#00C3F7',
        stripe: '#6772E5',
        flutterwave: '#F5A623',
      },
      backgroundImage: {
        'matte-black-bg': 'linear-gradient(0deg, #0A0A0A 0%, #0A0A0A 100%)', // Placeholder to maintain the object structure if needed, or just remove
      },
      boxShadow: {
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)',
        'inner-lg': 'inset 0 3px 6px 0 rgba(0, 0, 0, 0.7)',
        'inner-card': 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-glow-lg': '0 0 30px rgba(212, 175, 55, 0.5)',
      },
      keyframes: {
        'hero-luxury-flow': {
          '0%': { transform: 'scaleX(-1) rotate(0deg) scale(1.8)' },
          '100%': { transform: 'scaleX(-1) rotate(360deg) scale(1.8)' },
        }
      },
      animation: {
        'luxury-flow': 'hero-luxury-flow 120s linear infinite',
      }
    },
  },
  plugins: [
    tailwindAnimate,
    tailwindTypography,
  ],
}