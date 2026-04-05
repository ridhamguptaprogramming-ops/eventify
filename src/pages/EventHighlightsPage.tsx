import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Search,
  X,
  Users,
  MapPin,
  Calendar,
  Star,
  ChevronRight,
  Eye,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample event data - replace with actual data from API
const sampleEvents = [
  {
    id: 1,
    title: 'TechX 2026: AI Revolution',
    description: 'A groundbreaking summit exploring the future of artificial intelligence and its impact on technology.',
    date: 'March 15, 2026',
    location: 'San Francisco, CA',
    attendees: 2500,
    category: 'Tech Events',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
    featured: true,
    duration: '2:15:30',
    views: 15420,
  },
  {
    id: 2,
    title: 'Design Systems Summit',
    description: 'Leading designers and developers share insights on building scalable design systems.',
    date: 'February 28, 2026',
    location: 'New York, NY',
    attendees: 1200,
    category: 'Conferences',
    thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    featured: false,
    duration: '1:45:20',
    views: 8920,
  },
  {
    id: 3,
    title: 'Cloud Native Day',
    description: 'Deep dive into cloud-native technologies and modern infrastructure practices.',
    date: 'April 10, 2026',
    location: 'Seattle, WA',
    attendees: 1800,
    category: 'Tech Events',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    featured: false,
    duration: '3:20:45',
    views: 12340,
  },
  {
    id: 4,
    title: 'College Fest 2026',
    description: 'An electrifying college festival featuring music, tech talks, and cultural performances.',
    date: 'May 5, 2026',
    location: 'Austin, TX',
    attendees: 5000,
    category: 'College Fests',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    featured: false,
    duration: '4:10:15',
    views: 25600,
  },
  {
    id: 5,
    title: 'AI Workshop Series',
    description: 'Hands-on workshops teaching practical AI implementation and machine learning fundamentals.',
    date: 'January 20, 2026',
    location: 'Boston, MA',
    attendees: 300,
    category: 'Workshops',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    featured: false,
    duration: '1:30:00',
    views: 6780,
  },
  {
    id: 6,
    title: 'Future of Web Development',
    description: 'Exploring cutting-edge web technologies and the evolution of modern development practices.',
    date: 'June 12, 2026',
    location: 'Los Angeles, CA',
    attendees: 950,
    category: 'Tech Events',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    featured: false,
    duration: '2:50:30',
    views: 9870,
  },
];

const categories = ['All', 'Tech Events', 'College Fests', 'Workshops', 'Conferences'];

const AnimatedCounter: React.FC<{ value: string; suffix?: string }> = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/[^\d]/g, ''));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < target) {
        setCount(prev => Math.min(prev + Math.ceil(target / 50), target));
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [count, target]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      viewport={{ once: true }}
      className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
    >
      {count.toLocaleString()}{suffix}
    </motion.div>
  );
};

const EventHighlightsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<typeof sampleEvents[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const featuredVideo = sampleEvents.find(event => event.featured);

  const filteredEvents = sampleEvents.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openModal = (event: typeof sampleEvents[0]) => {
    setSelectedVideo(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Experience the{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Moments
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Explore highlights from events powered by Esoteric Hub — from tech summits to college fests.
          </motion.p>
        </div>
      </section>

      {/* Featured Video Section */}
      {featuredVideo && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative group cursor-pointer"
              onClick={() => openModal(featuredVideo)}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm border border-white/10">
                <img
                  src={featuredVideo.thumbnail}
                  alt={featuredVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                  </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-2xl font-bold mb-2">{featuredVideo.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredVideo.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {featuredVideo.location}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Trending Highlights */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-8"
          >
            Trending Highlights
          </motion.h2>
          <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {sampleEvents
              .filter(event => !event.featured)
              .sort((a, b) => b.views - a.views)
              .slice(0, 4)
              .map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-80 cursor-pointer group"
                  onClick={() => openModal(event)}
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
                      >
                        <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                      </motion.div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-xs text-white rounded-full">
                        {event.category}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h4 className="font-semibold mb-1">{event.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <span>{event.duration}</span>
                        <span>•</span>
                        <span>{event.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, categories, or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => openModal(event)}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                  <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
                    >
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h4 className="font-semibold mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-300 line-clamp-2">{event.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{event.date}</span>
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-xs text-white rounded-full">
                        {event.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                      <span>{event.duration}</span>
                      <span>•</span>
                      <span>{event.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="space-y-2">
              <AnimatedCounter value="10K" suffix="+" />
              <div className="text-gray-300">Attendees</div>
            </div>
            <div className="space-y-2">
              <AnimatedCounter value="50" suffix="+" />
              <div className="text-gray-300">Events Hosted</div>
            </div>
            <div className="space-y-2">
              <AnimatedCounter value="20" suffix="+" />
              <div className="text-gray-300">Cities</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          >
            <div className="flex items-center justify-center mb-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
                alt="Testimonial"
                className="w-16 h-16 rounded-full border-2 border-white/20"
              />
            </div>
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
              ))}
            </div>
            <blockquote className="text-xl italic text-gray-300 mb-4">
              "One of the best organized college events we've attended. The energy was incredible!"
            </blockquote>
            <cite className="text-gray-400">— Student Council President, Tech University</cite>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Want your event featured here?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-event"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group"
              >
                Host an Event
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
              >
                Explore Upcoming Events
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isModalOpen && selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-video">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{selectedVideo.title}</h3>
                <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>{selectedVideo.attendees.toLocaleString()} attendees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span>{selectedVideo.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>{selectedVideo.date}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    Share Event
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventHighlightsPage;