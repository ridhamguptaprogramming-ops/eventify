import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Users, CheckCircle, Clock, QrCode, Shield, Search, Filter, Download, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { Event, Registration, UserProfile, getAdminOverview, getUnverifiedUsers, getVerifiedUsers, markRegistrationAttendance, verifyUser } from '../lib/api';

type DetectedBarcode = {
  rawValue?: string;
};

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<UserProfile[]>([]);
  const [verifiedUsers, setVerifiedUsers] = useState<Array<UserProfile & { verificationQRCode?: string }>>([]);
  const [unverifiedLoadError, setUnverifiedLoadError] = useState<string | null>(null);
  const [verifyingUid, setVerifyingUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRequestRef = useRef<number | null>(null);
  const scannerActiveRef = useRef(false);
  const scannerCooldownUntilRef = useRef(0);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      setRegistrations([]);
      setEvents([]);
      setUnverifiedUsers([]);
      setUnverifiedLoadError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadOverview = async () => {
      setLoading(true);
      setUnverifiedLoadError(null);
      try {
        const data = await getAdminOverview();
        if (!isMounted) return;
        setRegistrations(data.registrations);
        setEvents(data.events);
      } catch (error) {
        console.error('Failed to load admin data from MongoDB API:', error);
        toast.error('Failed to load admin data.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      try {
        const pendingUsers = await getUnverifiedUsers();
        if (!isMounted) return;
        setUnverifiedUsers(pendingUsers);
      } catch (error) {
        console.error('Failed to load unverified users from MongoDB API:', error);
        if (!isMounted) return;
        setUnverifiedUsers([]);
        setUnverifiedLoadError('Could not load unverified accounts right now.');
      }

      try {
        const verified = await getVerifiedUsers();
        if (!isMounted) return;
        setVerifiedUsers(verified);
      } catch (error) {
        console.error('Failed to load verified users from MongoDB API:', error);
      }
    };

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const stopScanner = useCallback(() => {
    scannerActiveRef.current = false;

    if (frameRequestRef.current !== null) {
      cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleScan = useCallback(async (qrData: string) => {
    const reg = registrations.find(r => r.qrCode === qrData);
    
    if (!reg) {
      toast.error('Invalid QR Code.');
      return false;
    }

    if (reg.attended) {
      toast.info(`${reg.userName} has already checked in.`);
      return false;
    }

    try {
      await markRegistrationAttendance(reg.id, true);
      setRegistrations((previous) =>
        previous.map((registration) =>
          registration.id === reg.id
            ? { ...registration, attended: true, attendedAt: new Date().toISOString() }
            : registration
        )
      );
      toast.success(`Check-in successful for ${reg.userName}!`);
      setShowScanner(false);
      return true;
    } catch (error) {
      toast.error('Failed to update attendance.');
      return false;
    }
  }, [registrations]);

  const handleError = useCallback((err: unknown) => {
    console.error(err);
    toast.error('Camera error. Please check permissions.');
  }, []);

  useEffect(() => {
    if (!showScanner) {
      stopScanner();
      return;
    }

    let canceled = false;
    scannerCooldownUntilRef.current = 0;

    const startScanner = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Camera access is not supported in this browser.');
        return;
      }

      const BarcodeDetectorImpl = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;

      if (!BarcodeDetectorImpl) {
        toast.error('QR scanning is not supported in this browser.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });

        if (canceled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (!videoRef.current) {
          stopScanner();
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const detector = new BarcodeDetectorImpl({ formats: ['qr_code'] });
        scannerActiveRef.current = true;

        const scanFrame = async () => {
          if (!scannerActiveRef.current || !videoRef.current) return;

          try {
            if (Date.now() >= scannerCooldownUntilRef.current) {
              const barcodes = await detector.detect(videoRef.current);
              const qrData = barcodes.find((barcode) => typeof barcode.rawValue === 'string' && barcode.rawValue.trim().length > 0)?.rawValue?.trim();

              if (qrData) {
                const isSuccess = await handleScan(qrData);
                if (!isSuccess) {
                  scannerCooldownUntilRef.current = Date.now() + 1500;
                }
              }
            }
          } catch (error) {
            console.error('QR detection error:', error);
          } finally {
            frameRequestRef.current = requestAnimationFrame(() => {
              void scanFrame();
            });
          }
        };

        frameRequestRef.current = requestAnimationFrame(() => {
          void scanFrame();
        });
      } catch (error) {
        handleError(error);
      }
    };

    void startScanner();

    return () => {
      canceled = true;
      stopScanner();
    };
  }, [showScanner, handleScan, handleError, stopScanner]);

  const handleVerifyUser = async (uid: string) => {
    setVerifyingUid(uid);
    try {
      const verifiedUser = await verifyUser(uid) as any;
      setUnverifiedUsers((previous) => previous.filter((user) => user.uid !== uid));
      setVerifiedUsers((previous) => [
        ...previous,
        { ...verifiedUser, verificationQRCode: verifiedUser.verificationQRCode },
      ]);
      const nameOrEmail = verifiedUser.displayName || verifiedUser.email || uid;
      const qrText = verifiedUser.verificationQRCode ? ` (QR: ${verifiedUser.verificationQRCode})` : '';
      const message = verifiedUser.message ?? 'User verified and verification email sent.';
      toast.success(`${nameOrEmail} verified. ${message}${qrText}`);
    } catch (error) {
      console.error('Failed to verify user from MongoDB API:', error);
      toast.error('Failed to verify account.');
    } finally {
      setVerifyingUid(null);
    }
  };

  if (!isAdmin) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Access Denied. Admin only.</div>;

  const stats = [
    { label: 'Total Registrations', value: registrations.length, icon: <Users className="text-indigo-400" />, color: 'bg-indigo-500/10' },
    { label: 'Verified Attendance', value: registrations.filter(r => r.attended).length, icon: <CheckCircle className="text-teal-400" />, color: 'bg-teal-500/10' },
    { label: 'Pending Check-ins', value: registrations.filter(r => !r.attended).length, icon: <Clock className="text-pink-400" />, color: 'bg-pink-500/10' }
  ];

  const chartData = events.map(e => ({
    name: e.title.substring(0, 15) + '...',
    registrations: registrations.filter(r => r.eventId === e.id).length,
    attendance: registrations.filter(r => r.eventId === e.id && r.attended).length
  }));

  const filteredRegs = registrations.filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">ADMIN <span className="text-indigo-400">PANEL</span></h1>
            <p className="text-slate-400">Manage registrations, track attendance, and view analytics.</p>
          </div>
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20"
          >
            <Camera size={20} /> Scan QR Ticket
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                {stat.icon}
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">{stat.label}</p>
              <h3 className="text-4xl font-black text-white">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Unverified Accounts Box */}
        <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Unverified Accounts</h3>
              <p className="text-slate-400 text-sm mt-1">Admin action required: verify email accounts marked as unverified.</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider">
              {unverifiedUsers.length} Unverified
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((item) => (
                <div key={item} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : unverifiedLoadError ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 py-5 px-6 text-amber-200 text-sm font-medium">
              {unverifiedLoadError}
            </div>
          ) : unverifiedUsers.length === 0 ? (
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 py-5 px-6 text-teal-300 text-sm font-medium">
              All accounts are verified.
            </div>
          ) : (
            <div className="space-y-3">
              {unverifiedUsers.map((user) => (
                <div
                  key={user.uid}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-white font-semibold">{user.displayName || 'User'}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300">
                      Unverified
                    </span>
                    <button
                      onClick={() => void handleVerifyUser(user.uid)}
                      disabled={verifyingUid === user.uid}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all"
                    >
                      {verifyingUid === user.uid ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Users Cards */}
        <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Verified Users</h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300">
              {verifiedUsers.length} Verified
            </span>
          </div>

          {verifiedUsers.length === 0 ? (
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 py-5 px-6 text-teal-300 text-sm font-medium">
              No verified users yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifiedUsers.map((user) => (
                <div key={user.uid} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex justify-between gap-4 mb-3">
                    <div>
                      <p className="text-white font-semibold">{user.displayName || 'User'}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300">Verified</span>
                  </div>
                  {user.verificationQRCode ? (
                    <div className="space-y-3">
                      <p className="text-slate-400 text-xs break-words">QR: {user.verificationQRCode}</p>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(user.verificationQRCode)}`}
                        alt="Verified user QR code"
                        className="w-[150px] h-[150px] rounded-lg"
                      />
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">No QR data available</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl h-[400px]">
            <h3 className="text-xl font-bold text-white mb-8">Event Performance</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="registrations" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-8">Recent Registrations</h3>
            <div className="space-y-4 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
              {registrations.slice(0, 5).map((reg, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold">
                      {reg.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{reg.userName}</p>
                      <p className="text-slate-500 text-xs">{reg.eventTitle}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${reg.attended ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {reg.attended ? 'Attended' : 'Registered'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h3 className="text-2xl font-bold text-white">Registration Database</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
                <Download size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 pl-4">User</th>
                  <th className="pb-4">Event</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRegs.map((reg) => (
                  <tr key={reg.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                          {reg.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{reg.userName}</p>
                          <p className="text-slate-500 text-xs">{reg.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-slate-300 text-sm">{reg.eventTitle}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-slate-500 text-xs">{new Date(reg.registeredAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${reg.attended ? 'bg-teal-500/20 text-teal-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                        {reg.attended ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {reg.attended ? 'Attended' : 'Registered'}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      {!reg.attended && (
                        <button 
                          onClick={async () => {
                            try {
                              await markRegistrationAttendance(reg.id, true);
                              setRegistrations((previous) =>
                                previous.map((registration) =>
                                  registration.id === reg.id
                                    ? { ...registration, attended: true, attendedAt: new Date().toISOString() }
                                    : registration
                                )
                              );
                              toast.success('Check-in successful!');
                            } catch (error) {
                              console.error('Failed to mark attendance from MongoDB API:', error);
                              toast.error('Failed to update attendance.');
                            }
                          }}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Mark Present
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6"
          >
            <div className="relative w-full max-w-md bg-white/5 border border-white/10 rounded-[40px] p-10 text-center">
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <QrCode size={40} className="text-indigo-400" />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-4">SCAN TICKET</h2>
              <p className="text-slate-400 mb-10">Align the QR code within the frame to verify attendance.</p>

              <div className="relative aspect-square w-full bg-black rounded-[32px] overflow-hidden border-4 border-indigo-500/30">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  autoPlay
                />
                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-indigo-500 rounded-2xl animate-pulse" />
              </div>

              <button 
                onClick={() => setShowScanner(false)}
                className="mt-10 w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
              >
                Cancel Scanning
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
