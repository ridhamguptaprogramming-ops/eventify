import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, Clock, Shield, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Event, checkRegistration, createRegistration, getEventById } from '../lib/api';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const loadEvent = async () => {
      try {
        const eventData = await getEventById(id);
        if (isMounted) {
          setEvent(eventData);
        }
      } catch (error) {
        console.error('Failed to load event from MongoDB API:', error);
        toast.error('Failed to load event details.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadEvent();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !user) {
      setIsRegistered(false);
      return;
    }

    let isMounted = true;

    const loadRegistration = async () => {
      try {
        const status = await checkRegistration(user.uid, id);
        if (isMounted) {
          setIsRegistered(status.registered);
        }
      } catch (error) {
        console.error('Failed to check registration from MongoDB API:', error);
      }
    };

    void loadRegistration();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }

    if (!id || !event) return;

    setRegistering(true);
    try {
      await createRegistration({
        uid: user.uid,
        eventId: id,
        userEmail: user.email ?? '',
        userName: user.displayName ?? 'Event Attendee'
      });

      toast.success('Successfully registered for the event!');
      setIsRegistered(true);
      setEvent((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          registeredCount: prev.registeredCount + 1,
        };
      });
    } catch (error) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Failed to register. Please try again.';
      toast.error(message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;
  if (!event) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Event not found</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={20} /> Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden"
            >
              <div className="h-[400px] relative">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{event.title}</h1>
                  <div className="flex flex-wrap gap-6 text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} className="text-indigo-400" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={20} className="text-teal-400" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10">
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-white mb-6">About the Event</h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-12">{event.description}</p>

                  <h2 className="text-2xl font-bold text-white mb-8">Event Schedule</h2>
                  <div className="space-y-6 mb-12">
                    {(event.schedule || [
                      { time: '09:00 AM', activity: 'Registration & Welcome Coffee' },
                      { time: '10:00 AM', activity: 'Opening Keynote: The Future of Innovation' },
                      { time: '11:30 AM', activity: 'Panel Discussion: Industry Trends' },
                      { time: '01:00 PM', activity: 'Networking Lunch' },
                      { time: '02:30 PM', activity: 'Workshop Sessions' },
                      { time: '04:30 PM', activity: 'Closing Ceremony' }
                    ]).map((item, i) => (
                      <div key={i} className="flex gap-6 items-start group">
                        <div className="text-indigo-400 font-bold w-24 shrink-0 pt-1">{item.time}</div>
                        <div className="flex-1 pb-6 border-b border-white/5 group-last:border-0">
                          <h4 className="text-white font-bold text-lg mb-1">{item.activity}</h4>
                          <p className="text-slate-500 text-sm">Main Stage • Level 2</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-8">Featured Speakers</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {(event.speakers || [
                      { name: 'Dr. Sarah Chen', role: 'AI Research Lead, Google', image: 'https://i.pravatar.cc/150?u=sarah' },
                      { name: 'Marcus Thorne', role: 'Design Director, Apple', image: 'https://i.pravatar.cc/150?u=marcus' }
                    ]).map((speaker, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <img src={speaker.image} alt={speaker.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                          <h4 className="text-white font-bold">{speaker.name}</h4>
                          <p className="text-slate-500 text-sm">{speaker.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="text-slate-400 text-sm font-bold uppercase tracking-widest">Registration</div>
                  <div className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-bold">OPEN</div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Available Slots</span>
                    <span className="text-white font-bold">{event.capacity - event.registeredCount} / {event.capacity}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-teal-500" 
                      style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {isRegistered ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-3 text-teal-400 font-bold">
                      <CheckCircle size={20} /> You are registered!
                    </div>
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20"
                    >
                      View QR Ticket
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    {registering ? 'Processing...' : 'Register Now'}
                  </button>
                )}

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                    <Share2 size={16} /> Share Event
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                    <Shield size={16} /> Secure Payment
                  </button>
                </div>
              </motion.div>

              <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
                <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">If you have any questions about the event or registration process, our support team is here to help.</p>
                <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
