import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Rocket, Users, ArrowRight, X } from 'lucide-react';
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

const teamMembers = [
  {
    name: 'Asha',
    role: 'Front-end Engineer',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
    contributions: 'UI/UX, About / Events page styling, responsive interactions and animation flows.',
    linkedin: 'https://linkedin.com/in/asha-dev',
    instagram: 'https://instagram.com/asha.codes',
    github: 'https://github.com/asha-dev',
  },
  {
    name: 'Ravi',
    role: 'Back-end Engineer',
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=500&q=80',
    contributions: 'Firebase integration, API routes, and event CRUD logic with security rules.',
    linkedin: 'https://linkedin.com/in/ravi-tech',
    instagram: 'https://instagram.com/ravi.backend',
    github: 'https://github.com/ravi-tech',
  },
  {
    name: 'Meera',
    role: 'QA & Product',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=500&q=80',
    contributions: 'Test plans, flow validation, bug triage, and release quality ownership.',
    linkedin: 'https://linkedin.com/in/meera-quality',
    instagram: 'https://instagram.com/meera.qa',
    github: 'https://github.com/meera-testing',
  },
  {
    name: 'Nina',
    role: 'Design Systems Lead',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    contributions: 'Design language, accessibility, and component library governance for consistent UI.',
    linkedin: 'https://linkedin.com/in/nina-design',
    instagram: 'https://instagram.com/nina.designs',
    github: 'https://github.com/nina-design',
  },
  {
    name: 'Karan',
    role: 'DevOps Engineer',
    image: 'https://images.unsplash.com/photo-1488747279002-c8523379faaa?auto=format&fit=crop&w=500&q=80',
    contributions: 'CI/CD pipelines, infrastructure automation, and reliability engineering for scaling.',
    linkedin: 'https://linkedin.com/in/karan-ops',
    instagram: 'https://instagram.com/karan.devops',
    github: 'https://github.com/karan-ops',
  },
  {
    name: 'Samira',
    role: 'Customer Success Manager',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    contributions: 'Onboarding, support workflows, and feedback loops for product-market fit.',
    linkedin: 'https://linkedin.com/in/samira-cs',
    instagram: 'https://instagram.com/samira.success',
    github: 'https://github.com/samira-cs',
  },
  {
    name: 'Ishan',
    role: 'Data Analyst',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=500&q=80',
    contributions: 'Event analytics, dashboard metrics, and KPI reporting for data-driven decisions.',
    linkedin: 'https://linkedin.com/in/ishan-data',
    instagram: 'https://instagram.com/ishan.data',
    github: 'https://github.com/ishan-analytics',
  },
  {
    name: 'Priya',
    role: 'Mobile Engineer',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80',
    contributions: 'Cross-platform mobile features, performance tuning, and user experience enhancements.',
    linkedin: 'https://linkedin.com/in/priya-mobile',
    instagram: 'https://instagram.com/priya.codes',
    github: 'https://github.com/priya-mobile',
  },
];

export default function AboutPage() {
  const [selectedMember, setSelectedMember] = useState(null);

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

        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl font-black text-white mb-6">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <button
                key={member.name}
                onClick={() => setSelectedMember(member)}
                className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-indigo-400/50 hover:bg-indigo-400/15"
              >
                <img
                  src={member.image}
                  alt={`${member.name} photo`}
                  className="h-24 w-24 rounded-full object-cover"
                />
                <h3 className="mt-4 text-xl font-bold text-white">{member.name}</h3>
                <p className="text-sm text-slate-300">{member.role}</p>
                <p className="mt-2 text-slate-300 text-sm line-clamp-3">{member.contributions}</p>
              </button>
            ))}
          </div>
        </section>

        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-lg w-full rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-white">{selectedMember.name}</h3>
                  <p className="text-sm text-slate-300">{selectedMember.role}</p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="rounded-full border border-white/20 p-2 text-slate-200 hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="mt-4 text-slate-200">{selectedMember.contributions}</p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <a
                  href={selectedMember.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center rounded-lg border border-white/10 bg-indigo-600/20 px-3 py-2 text-indigo-200 hover:bg-indigo-600"
                >
                  LinkedIn
                </a>
                <a
                  href={selectedMember.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center rounded-lg border border-white/10 bg-pink-600/20 px-3 py-2 text-pink-200 hover:bg-pink-600"
                >
                  Instagram
                </a>
                <a
                  href={selectedMember.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center rounded-lg border border-white/10 bg-slate-700/20 px-3 py-2 text-slate-100 hover:bg-slate-700"
                >
                  GitHub
                </a>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="mt-6 w-full rounded-2xl bg-white/10 px-4 py-2 font-bold text-white hover:bg-white/20"
              >
                Close Profile
              </button>
            </motion.div>
          </div>
        )}

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
