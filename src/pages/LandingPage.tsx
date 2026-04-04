import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Calendar, History, MapPin, Shield, Sparkles, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Event, getEvents } from '../lib/api';

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

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

  useEffect(() => {
    let isMounted = true;

    const loadHomeEventData = async () => {
      try {
        const eventsData = await getEvents();
        if (!isMounted) return;

        const now = Date.now();
        const sortedByDateAsc = [...eventsData].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const upcomingEvents = sortedByDateAsc.filter((event) => new Date(event.date).getTime() >= now);

        setFeaturedEvent(upcomingEvents[0] ?? null);
        setActiveEvents(upcomingEvents);
      } catch (error) {
        console.error('Failed to load home page events:', error);
        if (isMounted) {
          toast.error('Unable to load active events right now.');
        }
      } finally {
        if (isMounted) {
          setEventsLoading(false);
        }
      }
    };

    void loadHomeEventData();

    return () => {
      isMounted = false;
    };
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

      <section className="relative px-6 pb-12">
        <div className="max-w-7xl mx-auto rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 text-xs uppercase tracking-[0.22em] font-bold text-indigo-300">
            Active Events
          </div>
          {eventsLoading ? (
            <div className="h-16 bg-white/5 animate-pulse" />
          ) : activeEvents.length > 0 ? (
            <div className="relative overflow-hidden">
              <div className="marquee-track flex w-max items-center gap-4 py-4 px-4">
                {[...activeEvents, ...activeEvents].map((event, index) => (
                  <Link
                    key={`${event.id}-${index}`}
                    to={`/events/${event.id}`}
                    className="shrink-0 whitespace-nowrap rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm text-slate-100 hover:bg-indigo-500/20 transition-colors"
                  >
                    <span className="font-semibold">{event.title}</span>
                    <span className="mx-2 text-indigo-300">|</span>
                    <span className="text-slate-300">{formatEventDate(event.date)}</span>
                    <span className="mx-2 text-indigo-300">|</span>
                    <span className="text-slate-300">{event.venue}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="px-6 py-5 text-slate-300 text-sm">No active events available right now.</p>
          )}
        </div>
      </section>

      <section className="relative px-6 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-indigo-600/15 to-teal-500/10 border border-white/10 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300 mb-3 font-bold flex items-center gap-2">
              <Sparkles size={14} /> Next Active Event
            </p>
            {eventsLoading ? (
              <div className="space-y-3">
                <div className="h-6 w-2/3 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse" />
                <div className="h-20 rounded bg-white/10 animate-pulse" />
              </div>
            ) : featuredEvent ? (
              <>
                <h3 className="text-2xl font-black text-white mb-3">{featuredEvent.title}</h3>
                <div className="space-y-2 text-sm text-slate-300 mb-5">
                  <p className="flex items-center gap-2">
                    <Calendar size={15} className="text-indigo-400" />
                    {formatEventDate(featuredEvent.date)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={15} className="text-teal-400" />
                    {featuredEvent.venue}
                  </p>
                </div>
                <p className="text-slate-300 leading-relaxed mb-6 line-clamp-4">{featuredEvent.description}</p>
                <Link
                  to={`/events/${featuredEvent.id}`}
                  className="inline-flex items-center gap-2 text-indigo-300 font-semibold hover:text-white transition-colors"
                >
                  Open Event <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <p className="text-slate-300">No active events are available yet. Create one to see it highlighted here.</p>
            )}
          </div>

          <div className="lg:col-span-3 p-8 rounded-3xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
              <History className="text-pink-400" size={24} />
              Active Event Queue
            </h2>
            <p className="text-slate-400 mb-6">Currently active events listed in upcoming order.</p>

            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : activeEvents.length > 0 ? (
              <div className="space-y-4">
                {activeEvents.slice(0, 3).map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-[#111a32] border border-white/5 hover:border-indigo-400/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{event.title}</p>
                      <p className="text-slate-400 text-sm mt-1">{formatEventDate(event.date)} - {event.venue}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#111a32] border border-white/5">
                <p className="text-white font-semibold mb-1">No active events yet</p>
                <p className="text-slate-400 text-sm">
                  Active events will appear here automatically once they are scheduled.
                </p>
              </div>
            )}
          </div>
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
