import React, { useState, useEffect } from 'react';
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
    name: 'Ridham Gupta',
    role: 'Technical Lead',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    contributions: 'Ridham — Technical ⚙️ is responsible for building and managing the community technical infrastructure, setting up organized channels, and integrating essential bots to ensure smooth communication, moderation, and an engaging user experience.',
    linkedin: 'https://www.linkedin.com/in/ridham-gupta-09056a386/',
    instagram: 'https://www.instagram.com/i.ridhamgupta/',
  },
  {
    name: 'Pranav Sharma ',
    role: 'Event Manager + Networking Lead',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    contributions: 'Firebase integration, API routes, and event CRUD logic with security rules.',
    linkedin: 'https://www.linkedin.com/in/hackwithpranav/',
    instagram: 'https://www.instagram.com/01pranav_sharma?igsh=MXczejU4bmUyb3Nqcg==',
  },
  {
    name: 'Arman Khan',
    role: 'SMM + Sponsor Reachout Lead',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=500&q=80',
    contributions: 'Test plans, flow validation, bug triage, and release quality ownership.',
    linkedin: 'https://linkedin.com/in/meera-quality',
    instagram: 'https://instagram.com/meera.qa',
  },
  {
    name: 'Ayan Khan',
    role: 'SMM + Sponsor Reachout Lead',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    contributions: 'Design language, accessibility, and component library governance for consistent UI.',
    linkedin: 'https://linkedin.com/in/nina-design',
    instagram: 'https://instagram.com/nina.designs',
  },
  {
    name: 'Ishika',
    role: 'SMM + Networking Lead',
    image: 'https://images.unsplash.com/photo-1488747279002-c8523379faaa?auto=format&fit=crop&w=500&q=80',
    contributions: 'CI/CD pipelines, infrastructure automation, and reliability engineering for scaling.',
    linkedin: 'https://linkedin.com/in/karan-ops',
    instagram: 'https://instagram.com/karan.devops',
  },
  {
    name: 'Anupam Singh',
    role: 'Networking + Event Manager',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    contributions: 'Onboarding, support workflows, and feedback loops for product-market fit.',
    linkedin: 'https://linkedin.com/in/samira-cs',
    instagram: 'https://instagram.com/samira.success',
  },
  {
    name: 'Prince Yadav',
    role: 'SMM + Member Management',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=500&q=80',
    contributions: 'Event analytics, dashboard metrics, and KPI reporting for data-driven decisions.',
    linkedin: 'https://linkedin.com/in/ishan-data',
    instagram: 'https://instagram.com/ishan.data',

  },
  {
    name: 'Khushal Agarwal',
    role: 'Technical + Guest/Speaker Outreach',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80',
    contributions: 'Full-Stack Developer, SDE Intern at Bluestock Fintech, and Founder of SakaarWeb, I build scalable GenAI products like my JEE Rank Predictor and Career Compass, a next-gen AI-powered job portal. Dedicated to digital transformation in Tier-2 and Tier-3 cities, I leverage my background with IIT entrepreneurship fests and PWSOS to bridge complex engineering with seamless UX. I’m always eager to collaborate on impactful tech—let’s build together!',
    linkedin: 'https://www.linkedin.com/in/khushal-agarwal-172406353?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    instagram: 'https://www.instagram.com/k_garg_4/',
  },
];

export default function AboutPage() {
  const [selectedMember, setSelectedMember] = useState(null);

  const closeModal = () => setSelectedMember(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    
    if (selectedMember) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedMember]);

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
                  className="h-32 w-32 rounded-full object-cover"
                />
                <h3 className="mt-4 text-xl font-bold text-white">{member.name}</h3>
                <p className="text-sm text-slate-300">{member.role}</p>
                <p className="mt-2 text-slate-300 text-sm line-clamp-3 leading-relaxed">{member.contributions}</p>
              </button>
            ))}
          </div>
        </section>

        {selectedMember && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 id="member-modal-title" className="text-2xl font-black text-white">{selectedMember.name}</h3>
                  <p className="text-sm text-slate-300">{selectedMember.role}</p>
                </div>
                <button
                  onClick={closeModal}
                  aria-label={`Close ${selectedMember.name} profile`}
                  className="rounded-full border border-white/20 p-2 text-slate-200 hover:bg-white/10 transition"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="mt-4 text-slate-200 leading-relaxed">{selectedMember.contributions}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                {selectedMember.linkedin && (
                  <a
                    href={selectedMember.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${selectedMember.name} LinkedIn profile`}
                    className="flex-1 min-w-max text-center rounded-lg border border-white/10 bg-indigo-600/20 px-3 py-2 text-indigo-200 hover:bg-indigo-600 transition"
                  >
                    LinkedIn
                  </a>
                )}
                {selectedMember.instagram && (
                  <a
                    href={selectedMember.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${selectedMember.name} Instagram profile`}
                    className="flex-1 min-w-max text-center rounded-lg border border-white/10 bg-pink-600/20 px-3 py-2 text-pink-200 hover:bg-pink-600 transition"
                  >
                    Instagram
                  </a>
                )}
                {selectedMember.github && (
                  <a
                    href={selectedMember.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${selectedMember.name} GitHub profile`}
                    className="flex-1 min-w-max text-center rounded-lg border border-white/10 bg-slate-700/20 px-3 py-2 text-slate-100 hover:bg-slate-700 transition"
                  >
                    GitHub
                  </a>
                )}
              </div>
              <button
                onClick={closeModal}
                className="mt-6 w-full rounded-2xl bg-white/10 px-4 py-2 font-bold text-white hover:bg-white/20 transition"
              >
                Close Profile
              </button>
            </motion.div>
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-slate-900/30 to-emerald-500/20 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-black text-white">Ready to experience Eventify?</h2>
          <p className="mt-4 max-w-2xl text-slate-200 leading-relaxed">
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
