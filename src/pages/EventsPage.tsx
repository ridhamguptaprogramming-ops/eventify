import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Event, getEvents } from '../lib/api';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        const eventsData = await getEvents();
        if (isMounted) {
          setEvents(eventsData);
        }
      } catch (error) {
        console.error('Failed to load events from MongoDB API:', error);
        toast.error('Failed to load events. Please refresh.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-black text-white mb-4">UPCOMING <span className="text-indigo-400">EVENTS</span></h1>
            <p className="text-slate-400 text-lg">Discover and register for the most innovative events in technology and design.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <Link
                to="/events/new"
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold transition-all whitespace-nowrap"
              >
                <Plus size={18} /> Add New Event
              </Link>
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[500px] bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 line-clamp-1">{event.title}</h3>
                  <p className="text-slate-400 mb-6 line-clamp-2 leading-relaxed">{event.description}</p>
                  
                  <div className="flex flex-col gap-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                      <MapPin size={16} className="text-indigo-400" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                      <Users size={16} className="text-teal-400" />
                      <span>{event.registeredCount} / {event.capacity} Registered</span>
                    </div>
                  </div>

                  <Link 
                    to={`/events/${event.id}`} 
                    className="w-full py-4 bg-white/5 group-hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-white/10 group-hover:border-indigo-600"
                  >
                    View Details <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
