import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db, collection, getDocs, onSnapshot, query, where, doc, setDoc } from '../lib/firebase';
import { Calendar, MapPin, Users, ArrowRight, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  image: string;
  capacity: number;
  registeredCount: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventsData);
      setLoading(false);

      // Seed mock data if empty
      if (eventsData.length === 0) {
        seedMockEvents();
      }
    });

    return () => unsubscribe();
  }, []);

  const seedMockEvents = async () => {
    const mockEvents = [
      {
        id: '1',
        title: 'TechX 2026: The AI Revolution',
        description: 'Join industry leaders for a deep dive into the future of artificial intelligence and its impact on society.',
        date: new Date(Date.now() + 86400000 * 7).toISOString(),
        venue: 'Grand Innovation Hall, Silicon Valley',
        image: 'https://picsum.photos/seed/tech/800/600',
        capacity: 500,
        registeredCount: 120
      },
      {
        id: '2',
        title: 'Design Systems Summit',
        description: 'A gathering of world-class designers to discuss the evolution of design systems and user experience.',
        date: new Date(Date.now() + 86400000 * 14).toISOString(),
        venue: 'The Creative Hub, New York',
        image: 'https://picsum.photos/seed/design/800/600',
        capacity: 300,
        registeredCount: 85
      },
      {
        id: '3',
        title: 'Cloud Native Day',
        description: 'Everything you need to know about Kubernetes, serverless, and the modern cloud infrastructure.',
        date: new Date(Date.now() + 86400000 * 21).toISOString(),
        venue: 'Tech Park, London',
        image: 'https://picsum.photos/seed/cloud/800/600',
        capacity: 400,
        registeredCount: 210
      }
    ];

    for (const event of mockEvents) {
      await setDoc(doc(db, 'events', event.id), event);
    }
  };

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
          
          <div className="flex items-center gap-4 w-full md:w-auto">
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
