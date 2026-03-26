import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Calendar, Users, Shield, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.animate-up'),
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }
      );
    }

    if (shapesRef.current) {
      gsap.to(shapesRef.current.querySelectorAll('.floating-shape'), {
        y: 'random(-40, 40)',
        x: 'random(-40, 40)',
        rotation: 'random(-45, 45)',
        duration: 'random(3, 6)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { amount: 2 }
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0F172A] overflow-hidden">
      {/* Animated Background Shapes */}
      <div ref={shapesRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape absolute top-[10%] left-[5%] w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="floating-shape absolute top-[40%] right-[10%] w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="floating-shape absolute bottom-[10%] left-[20%] w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-medium mb-8"
        >
          <Zap size={14} />
          <span>The Future of Event Management</span>
        </motion.div>

        <h1 className="animate-up text-6xl md:text-8xl font-black text-white mb-8 tracking-tight leading-[0.9]">
          ELEVATE YOUR <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-400 to-pink-400">
            EVENT EXPERIENCE
          </span>
        </h1>

        <p className="animate-up text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Premium attendance tracking, real-time analytics, and seamless QR-based check-ins for modern events.
        </p>

        <div className="animate-up flex flex-col sm:flex-row gap-4">
          <Link to="/events" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 group">
            Explore Events <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg transition-all backdrop-blur-sm">
            Watch Demo
          </button>
        </div>

        {/* Stats / Features Grid */}
        <div className="animate-up grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
          {[
            { icon: <Calendar className="text-indigo-400" />, title: "Smart Scheduling", desc: "Manage complex event timelines with ease." },
            { icon: <Users className="text-teal-400" />, title: "Real-time Attendance", desc: "Track check-ins live with QR technology." },
            { icon: <Shield className="text-pink-400" />, title: "Secure Access", desc: "Enterprise-grade security for your data." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-12">Trusted by Innovation Leaders</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            {['Microsoft', 'Google', 'Adobe', 'Stripe', 'Figma'].map(brand => (
              <span key={brand} className="text-2xl font-black text-white">{brand}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
