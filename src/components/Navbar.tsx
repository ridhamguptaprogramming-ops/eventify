import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, LogOut, User, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider, signInWithPopup, signOut } from '../lib/firebase';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/10 backdrop-blur-xl border-b border-white/20 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Calendar className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-teal-400">Eventify</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
          <Link to="/events" className="text-white/80 hover:text-white transition-colors">Events</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">Dashboard</Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
                  <Shield size={16} /> Admin
                </Link>
              )}
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="flex items-center gap-2">
                  <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-white/20" />
                  <span className="text-sm font-medium text-white/90">{user.displayName}</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-white/60 hover:text-white transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <button onClick={handleLogin} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-all shadow-lg shadow-indigo-500/20">
              <LogIn size={18} /> Login
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="text-lg text-white/80 py-2">Home</Link>
            <Link to="/events" onClick={() => setIsOpen(false)} className="text-lg text-white/80 py-2">Events</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg text-white/80 py-2">Dashboard</Link>
                {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="text-lg text-indigo-400 py-2">Admin Panel</Link>}
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 py-2">
                  <LogOut size={20} /> Logout
                </button>
              </>
            ) : (
              <button onClick={handleLogin} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium">
                <LogIn size={18} /> Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
