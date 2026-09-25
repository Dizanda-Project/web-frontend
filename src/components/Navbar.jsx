import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

export default function Navbar({ onOpenCart }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navLinks = [
    { name: 'Collection', path: '/collection' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 py-6 ${isScrolled ? 'bg-luxury-cream/80 backdrop-blur-md border-b border-luxury-sand/40 shadow-sm py-4' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        
        {/* Minimal Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-8 text-xs tracking-luxury uppercase">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`hover:text-luxury-champagne transition-colors relative py-1 ${
                location.pathname === link.path ? 'text-luxury-champagne' : 'text-luxury-charcoal'
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <motion.div 
                  layoutId="navbar-indicator" 
                  className="absolute bottom-0 left-0 w-full h-px bg-luxury-champagne" 
                />
              )}
            </Link>
          ))}
        </div>

        {/* Brand Centerpiece */}
        <Link to="/" className="text-2xl md:text-3xl font-light tracking-extreme uppercase font-serif text-luxury-charcoal hover:opacity-90 transition-opacity">
          DIZANDA
        </Link>

        {/* Action Icons */}
        <div className="flex items-center space-x-6 text-luxury-charcoal">
          {user ? (
            <div className="hidden sm:flex items-center space-x-4">
              <Link to="/login" className="flex items-center space-x-2 hover:text-luxury-champagne transition-colors">
                <User size={18} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-widest">{user.user_metadata?.full_name || user.email.split('@')[0]}</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="hover:text-luxury-champagne transition-colors focus:outline-none flex items-center" 
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={18} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-luxury-champagne transition-colors hidden sm:block">
              <User size={18} strokeWidth={1.5} />
            </Link>
          )}
          <button
            onClick={onOpenCart}
            aria-label="Open cart"
            data-cart-icon
            className="hover:text-luxury-champagne transition-colors relative"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 1.6, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="absolute -top-1.5 -right-2 bg-luxury-charcoal text-luxury-cream text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-sans"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden hover:text-luxury-champagne transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Slidedown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full bg-luxury-cream/95 backdrop-blur-md border-b border-luxury-sand px-8 py-6 flex flex-col space-y-4 text-xs tracking-luxury uppercase md:hidden shadow-lg"
          >
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)} 
              className={`py-2 border-b border-luxury-sand/30 ${location.pathname === '/' ? 'text-luxury-champagne font-medium' : ''}`}
            >
              Home
            </Link>
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                onClick={() => setIsOpen(false)} 
                className={`py-2 border-b border-luxury-sand/30 ${location.pathname === link.path ? 'text-luxury-champagne font-medium' : ''}`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)} 
                  className="py-2 flex items-center space-x-2 border-b border-luxury-sand/30"
                >
                  <User size={14} />
                  <span>{user.user_metadata?.full_name || user.email.split('@')[0]}</span>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="py-2 flex items-center space-x-2 text-left focus:outline-none"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)} 
                className="py-2"
              >
                Profile / Account
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}