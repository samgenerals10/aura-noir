/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * Learning notes:
 * - All TypeScript types/interfaces were removed (JS doesn’t use them).
 * - Runtime logic is unchanged; UI/Tailwind classes should render exactly the same.
 * - Read the inline comments around state, effects, handlers, and data flow.
 */
import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { ADMIN_CONTACT, buildInstagramURL } from '@/config/adminContact';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

const Footer= () => {
  const { dispatch } = useStore();
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    toast.success('Subscribed successfully Welcome to LUXESTORE.');
    setEmail('');
  };

  return (
    <footer className="relative border-t border-white/10">
      {/* Newsletter Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-3">Scent Your Aura</h3>
            <p className="text-white/50 mb-8">
              Subscribe to get exclusive scent previews, new perfume collections, and fragrance tips delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-gold/50 transition-all"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-black rounded-xl text-white font-semibold hover:bg-black/90 transition-all shadow-lg whitespace-nowrap"
              >
                <span>Subscribe</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              {/* <div className="w-10 h-10 rounded-xl bg-blackbr pink-500 red-500 rose-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">AN</span>
              </div> */}
              <span className="ml-3 text-xl font-bold text-gold">
                AURA-NOIR
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              The ultimate source for world-class luxury perfumes. Find your essence, define your aura.
            </p>
            <div className="flex items-center space-x-3">
              {/* Social Icons */}
              <a
                href={buildInstagramURL()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${ADMIN_CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', view: 'shop', scroll: true },
                { name: 'Shop All', view: 'shop', category: 'all' },
                { name: 'About Our Brand', view: 'about' },
                { name: 'Contact & FAQ', view: 'contact' }
              ].map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      dispatch({ type: 'SET_VIEW', view: item.view });
                      if (item.category) dispatch({ type: 'SET_CATEGORY', category: item.category });
                      if (item.scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-sm text-white/40 hover:text-gold transition-colors flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-3">
              {['Contact Us', 'Shipping Info', 'Returns & Exchanges', 'Size Guide', 'FAQ'].map(
                (link) => (
                  <li key={link}>
                    <button
                      onClick={() => toast.info(`${link} page coming soon`)}
                      className="text-sm text-white/40 hover:text-gold transition-colors flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      {link}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact & Partners</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <ArrowRight className="w-4 h-4 text-gold flex-shrink-0" />
                <a 
                  href="https://hairstudio.example.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gold font-semibold hover:text-gold-bright transition-colors"
                >
                  Visit Hair Studio Partner
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/40">
                  Fragrance Plaza, Suite 777
                  <br />
                  Paris & New York
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a href={`tel:+${ADMIN_CONTACT.whatsapp}`} className="text-sm text-white/40 hover:text-gold transition-colors">
                  +{ADMIN_CONTACT.whatsapp.replace(/(\d{3})(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4')}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a href="mailto:aura-noir-perfumes@gmail.com" className="text-sm text-white/40 hover:text-gold transition-colors">
                  aura-noir-perfumes@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; 2026 AURA-NOIR PERFUMES. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
              <button
                key={link}
                onClick={() => toast.info(`${link} page coming soon`)}
                className="text-xs text-white/30 hover:text-gold transition-colors"
              >
                {link}
              </button>
            ))}
          </div>
          {/* Payment Methods */}
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 font-medium">
              Paystack
            </div>
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 font-medium">
              Visa
            </div>
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 font-medium">
              Mastercard
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
