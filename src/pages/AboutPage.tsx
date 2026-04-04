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
    description: 'Esoteric Hub is designed around dependable access control and secure event operations.',
  },
];

type TeamMember = {
  github?: string;
  name: string;
  role: string;
  image: string;
  contributions: string;
  linkedin: string;
  instagram: string;
};

const teamMembers: TeamMember[] = [
  {
    name: 'Ridham gupta',
    role: 'Co-Founder & CEO',
    image: 'image/2.png',
    contributions: 'Alice leads the vision and strategy for Esoteric Hub, ensuring we build a product that truly serves event organizers and attendees.',
    linkedin: 'https://www.linkedin.com/in/ridham-gupta-09056a386/',
    instagram: 'https://www.instagram.com/i.ridhamgupta/',
  },
  {
    name: 'Pranav Sharma',
    role: 'Co-Founder & CTO',
    image: 'image/1.png',
    contributions: 'Bob oversees all technical aspects of Esoteric Hub, from architecture to implementation, ensuring a reliable and scalable platform.',
    linkedin: 'https://www.linkedin.com/in/hackwithpranav/',
    instagram: 'https://www.instagram.com/01pranav_sharma?igsh=MXczejU4bmUyb3Nqcg%3D%3D'
  },
  {
    name: 'Arman Khan',
    role: 'CTO',
    image: 'image/3.png',
    contributions: 'Charlie is responsible for the technical vision and execution of Esoteric Hub, leading our engineering team to build a robust and innovative platform.',
    linkedin: 'https://www.linkedin.com/in/arman-khan-778874350/',
    instagram: ''
  },
  {
    name: 'Mohammad Ayan khan',
    role: 'Lead Designer',
    image: 'image/4.png',
    contributions: 'Dana crafts the user experience and visual design of Esoteric Hub, ensuring our platform is intuitive and delightful to use.',
    linkedin: 'https://www.linkedin.com/in/mohammad-ayan-khan-40a164333/',
    instagram: 'https://www.instagram.com/ayan_verse_diaries?igsh=MTlsMThsdWMxa3ZuZw%3D%3D',
  },
  {
    name: 'KHUSHAL AGARWAL',
    role: 'Head of Marketing',
    image: 'image/5.png',
    contributions: 'Evan leads our marketing efforts, sharing the story of Esoteric Hub and connecting with event organizers around the world.',
    linkedin: 'https://www.linkedin.com/in/khushal-agarwal-172406353/',
    instagram: 'https://www.instagram.com/k_garg_4/',
  },
  {
    name: 'Fiona Green',
    role: 'Customer Success Manager',
    image: '/team/fiona.jpg',
    contributions: 'Fiona works closely with our customers to ensure they get the most out of Esoteric Hub, providing support and gathering feedback to continuously improve our platform.',
    linkedin: 'https://www.linkedin.com/in/fionagreen',
    instagram: 'https://www.instagram.com/fionagreen',
  },
  {
    name: 'Fiona Green',
    role: 'Customer Success Manager',
    image: '/team/fiona.jpg',
    contributions: 'Fiona works closely with our customers to ensure they get the most out of Esoteric Hub, providing support and gathering feedback to continuously improve our platform.',
    linkedin: 'https://www.linkedin.com/in/fionagreen',
    instagram: 'https://www.instagram.com/fionagreen',
  },
];  
  
export default function AboutPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const closeModal = () => setSelectedMember(null);
  const markImageFailed = (memberName: string) => {
    setFailedImages((prev) => ({ ...prev, [memberName]: true }));
  };
  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  const shouldRenderImage = (member: TeamMember) => Boolean(member.image) && !failedImages[member.name];

  useEffect(() => {
    const handleEscape = (e: { key: string; }) => {
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
            About Esoteric Hub
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-black leading-[0.95]">
            Built To Run
            <span className="block bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Better Events
            </span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg text-slate-300 leading-relaxed">
            Esoteric Hub helps teams plan events with clarity, engage audiences in real time, and make decisions with confidence. Our focus is simple: less chaos, better outcomes, and a platform people enjoy using.
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

        <section id="team" className="mb-16 md:mb-24">
          <h2 className="text-3xl font-black text-white mb-6">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <button
                key={member.name}
                onClick={() => setSelectedMember(member)}
                className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-indigo-400/50 hover:bg-indigo-400/15"
              >
                {shouldRenderImage(member) ? (
                  <img
                    src={member.image}
                    alt={`${member.name} photo`}
                    className="h-32 w-32 rounded-full object-cover"
                    loading="lazy"
                    onError={() => markImageFailed(member.name)}
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/80 to-teal-500/70 flex items-center justify-center text-white text-2xl font-black">
                    {getInitials(member.name)}
                  </div>
                )}
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
                <div className="flex items-center gap-4">
                  {shouldRenderImage(selectedMember) ? (
                    <img
                      src={selectedMember.image}
                      alt={`${selectedMember.name} profile`}
                      className="h-16 w-16 rounded-full object-cover"
                      onError={() => markImageFailed(selectedMember.name)}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500/80 to-teal-500/70 flex items-center justify-center text-white text-lg font-black">
                      {getInitials(selectedMember.name)}
                    </div>
                  )}
                  <div>
                  <h3 id="member-modal-title" className="text-2xl font-black text-white">{selectedMember.name}</h3>
                  <p className="text-sm text-slate-300">{selectedMember.role}</p>
                  </div>
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
          <h2 className="text-3xl md:text-4xl font-black text-white">Ready to experience Esoteric Hub?</h2>
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
