import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Rocket, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  {
    icon: Rocket,
    title: 'Fast Event Setup',
    description: 'Create, publish, and manage event journeys in minutes with a workflow designed for busy teams.',
  },
  {
    icon: Users,
    title: 'Audience-First Experience',
    description: 'From registration to check-in, every step is built to feel smooth for attendees and organizers.',
  },
  {
    icon: ShieldCheck,
    title: 'Reliable & Secure',
    description: 'Eventify is designed around dependable access control and secure event operations.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <section className="mb-16 md:mb-24">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-300">
            About Eventify
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-black leading-[0.95]">
            Built To Run
            <span className="block bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Better Events
            </span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg text-slate-300 leading-relaxed">
            Eventify helps teams plan events with clarity, engage audiences in real time, and make decisions with confidence. Our focus is simple: less chaos, better outcomes, and a platform people enjoy using.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 md:mb-24">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-8"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                  <Icon size={22} />
                </div>
                <h2 className="text-2xl font-bold text-white">{item.title}</h2>
                <p className="mt-4 text-slate-300 leading-relaxed">{item.description}</p>
              </motion.article>
            );
          })}
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-slate-900/30 to-emerald-500/20 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-black text-white">Ready to experience Eventify?</h2>
          <p className="mt-4 max-w-2xl text-slate-200">
            Browse live events, explore details, and start building better event experiences for your community.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white transition-colors hover:bg-indigo-500"
            >
              Explore Events <ArrowRight size={18} />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-bold text-white transition-colors hover:bg-white/10"
            >
              Back To Home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
