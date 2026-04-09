import type { Event } from './api';

export function buildFallbackEvents(): Event[] {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  return [
    {
      id: 'fallback-ongoing',
      title: 'AI Builders Live: Product Sprint',
      description:
        'A live session focused on shipping practical AI features with real implementation walkthroughs.',
      location: 'Virtual Arena',
      startDateTime: new Date(now - hour).toISOString(),
      endDateTime: new Date(now + (2 * hour)).toISOString(),
      status: 'ongoing',
      attendeesCount: 164,
      isHighlighted: true,
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      capacity: 500,
      registeredCount: 164,
      ticketPrice: 0,
    },
    {
      id: 'fallback-upcoming',
      title: 'Design + Data Connect Workshop',
      description:
        'Design systems, data workflows, and performance patterns for modern web event products.',
      location: 'Innovation Hub, San Francisco',
      startDateTime: new Date(now + (2 * day)).toISOString(),
      endDateTime: new Date(now + (2 * day) + (3 * hour)).toISOString(),
      status: 'upcoming',
      attendeesCount: 92,
      isHighlighted: false,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
      capacity: 300,
      registeredCount: 92,
      ticketPrice: 399,
    },
    {
      id: 'fallback-completed',
      title: 'Cloud Native Summit Replay',
      description:
        'Watch key sessions and highlights from the latest cloud-native architecture conference.',
      location: 'Replay Library',
      startDateTime: new Date(now - (4 * day)).toISOString(),
      endDateTime: new Date(now - (4 * day) + (3 * hour)).toISOString(),
      status: 'completed',
      attendeesCount: 240,
      isHighlighted: false,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      capacity: 600,
      registeredCount: 240,
      ticketPrice: 0,
    },
  ];
}
