import React, { useState } from 'react';
import { Mail, MapPin, ChevronDown, MessageCircle } from 'lucide-react';
import { ADMIN_CONTACT } from '@/config/adminContact';

const faqs = [
  {
    q: "How long do your scents last?",
    a: "Our perfumes are Eau de Parfum concentration, typically lasting 8-10 hours on skin and up to 24 hours on clothing."
  },
  {
    q: "Do you offer international shipping?",
    a: "Yes, we ship globally using premium courier services. Delivery times typically range from 3-7 business days."
  },
  {
    q: "Are your candles made from natural wax?",
    a: "Yes, all Aura Noir candles are hand-poured using a bespoke blend of coconut and soy wax for a clean, sustainable burn."
  },
  {
    q: "Can I get a custom scent consultation?",
    a: "Absolutely. You can reach out via WhatsApp or our contact form to schedule a 1-on-1 session with our fragrance stylists."
  }
];

const ContactSection = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* Left Side: Contact Info */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Contact Us</h1>
            <p className="text-white/50 text-lg">We&apos;re here to assist with your olfactory journey.</p>
          </div>

          <div className="space-y-8">
            <a 
              href={`mailto:aura-noir-perfumes@gmail.com`}
              className="group flex items-center space-x-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Email</div>
                <div className="text-lg font-medium">aura-noir-perfumes@gmail.com</div>
              </div>
            </a>

            <a 
              href={`https://wa.me/${ADMIN_CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-white/30 uppercase tracking-widest mb-1">WhatsApp</div>
                <div className="text-lg font-medium">Chat with us directly</div>
              </div>
            </a>

            <div className="flex items-center space-x-6 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Presence</div>
                <div className="text-lg font-medium">Paris • New York • Accra</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: FAQ */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-white/90">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gold transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40' : 'max-h-0'}`}>
                  <div className="p-6 pt-0 text-white/40 leading-relaxed border-t border-white/5 mt-2">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactSection;
