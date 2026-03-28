import React from 'react';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-black text-white mb-6">Eventify</h2>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              The ultimate platform for modern event management and attendance tracking. 
              Elevate your experience with real-time analytics and seamless check-ins.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
                { icon: Github, label: 'GitHub', href: 'https://github.com' },
                { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/events" className="hover:text-indigo-400 transition-colors">Events</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="mailto:support@eventify.app" className="hover:text-indigo-400 transition-colors">Contact Support</a></li>
              <li><a href="mailto:hello@eventify.app" className="hover:text-indigo-400 transition-colors">Partnerships</a></li>
              <li><a href="mailto:privacy@eventify.app" className="hover:text-indigo-400 transition-colors">Privacy</a></li>
              <li><a href="mailto:legal@eventify.app" className="hover:text-indigo-400 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm">© 2026 Eventify Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            Made with <Heart size={14} className="text-pink-500 fill-pink-500" /> by ridham.gupta
          </div>
        </div>
      </div>
    </footer>
  );
}
