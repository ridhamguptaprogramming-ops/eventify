import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db, collection, query, where, onSnapshot, doc, getDoc } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, CheckCircle, Clock, QrCode, User, Mail, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  status: string;
  attended: boolean;
  registeredAt: string;
  qrCode: string;
}

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'registrations'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const regs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
      setRegistrations(regs);
      setLoading(false);
      if (regs.length > 0 && !selectedReg) {
        setSelectedReg(regs[0]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Please login to view dashboard</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* User Profile Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl text-center"
            >
              <div className="relative inline-block mb-6">
                <img src={user.photoURL || ''} alt="" className="w-24 h-24 rounded-3xl border-2 border-indigo-500 p-1" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center border-4 border-[#0F172A]">
                  <CheckCircle size={14} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{user.displayName}</h2>
              <p className="text-slate-400 text-sm mb-8">{user.email}</p>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <Shield size={20} className="text-indigo-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Account Type</p>
                    <p className="text-white font-medium capitalize">{profile?.role || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <Mail size={20} className="text-teal-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Verification Status</p>
                    <p className="text-white font-medium">{profile?.isVerified ? 'Verified' : 'Pending Verification'}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* QR Code Card (Selected Registration) */}
            {selectedReg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center shadow-2xl shadow-indigo-600/20"
              >
                <div className="flex items-center justify-center gap-2 mb-6 text-indigo-100 font-bold uppercase tracking-widest text-xs">
                  <QrCode size={16} /> Your Entry Ticket
                </div>
                <div className="bg-white p-6 rounded-3xl inline-block mb-6 shadow-xl">
                  <QRCodeSVG value={selectedReg.qrCode} size={180} level="H" />
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{selectedReg.eventTitle}</h3>
                <p className="text-indigo-100 text-sm mb-6">Show this QR code at the entrance for quick check-in.</p>
                <div className={`py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${selectedReg.attended ? 'bg-teal-400/20 text-teal-300' : 'bg-white/20 text-white'}`}>
                  {selectedReg.attended ? 'Attendance Verified' : 'Check-in Pending'}
                </div>
              </motion.div>
            )}
          </div>

          {/* Registrations List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white">MY <span className="text-indigo-400">REGISTRATIONS</span></h2>
              <div className="text-slate-500 text-sm font-bold">{registrations.length} Events</div>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />)}
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-12 rounded-[32px] bg-white/5 border border-white/10 text-center">
                <Calendar size={48} className="text-slate-700 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">No registrations yet</h3>
                <p className="text-slate-500 mb-8">You haven't registered for any upcoming events.</p>
                <Link to="/events" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all inline-block">
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {registrations.map((reg, index) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedReg(reg)}
                    className={`group p-6 rounded-[32px] border transition-all cursor-pointer flex flex-col md:flex-row items-center gap-6 ${selectedReg?.id === reg.id ? 'bg-white/10 border-indigo-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${reg.attended ? 'bg-teal-500/20 text-teal-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      {reg.attended ? <CheckCircle size={32} /> : <Clock size={32} />}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{reg.eventTitle}</h3>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(reg.registeredAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>Main Venue</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${reg.attended ? 'bg-teal-500/10 text-teal-400' : 'bg-white/5 text-slate-400'}`}>
                        {reg.attended ? 'Attended' : 'Registered'}
                      </div>
                      <button className="p-3 bg-white/5 rounded-xl text-white group-hover:bg-indigo-600 transition-all">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
