import React, { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createEvent } from '../lib/api';

function getDefaultDateTimeLocal() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setMinutes(0, 0, 0);
  return date.toISOString().slice(0, 16);
}

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getDefaultDateTimeLocal);
  const [venue, setVenue] = useState('');
  const [image, setImage] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [capacity, setCapacity] = useState('100');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedCapacity = Number(capacity);
    if (Number.isNaN(parsedCapacity) || parsedCapacity < 1) {
      toast.error('Capacity must be greater than 0.');
      return;
    }

    setSaving(true);
    try {
      const created = await createEvent({
        title: title.trim(),
        description: description.trim(),
        date: new Date(date).toISOString(),
        venue: venue.trim(),
        image: image.trim(),
        capacity: parsedCapacity,
      });

      toast.success('Event created successfully.');
      navigate(`/events/${created.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create event.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={18} /> Back to Events
        </Link>

        <div className="p-8 md:p-10 rounded-[32px] bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <PlusCircle className="text-indigo-400" size={24} />
            <h1 className="text-3xl md:text-4xl font-black text-white">CREATE NEW EVENT</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                Event Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#111b31] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="TechX 2027"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Date & Time
                </label>
                <input
                  id="date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-[#111b31] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Capacity
                </label>
                <input
                  id="capacity"
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  className="w-full bg-[#111b31] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                Venue
              </label>
              <input
                id="venue"
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                className="w-full bg-[#111b31] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Main Hall, City Center"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                Image URL (Optional)
              </label>
              <input
                id="image"
                type="url"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setImagePreviewError(false);
                }}
                className="w-full bg-[#111b31] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/event-image.jpg"
              />
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#111b31] overflow-hidden">
                {image.trim() && !imagePreviewError ? (
                  <img
                    src={image.trim()}
                    alt="Event preview"
                    className="w-full h-56 object-cover"
                    referrerPolicy="no-referrer"
                    onLoad={() => setImagePreviewError(false)}
                    onError={() => setImagePreviewError(true)}
                  />
                ) : (
                  <div className="h-56 flex items-center justify-center text-slate-400 text-sm px-4 text-center">
                    {image.trim()
                      ? 'Unable to load image preview. Please check the URL.'
                      : 'Live preview will appear here when you enter an image URL.'}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full bg-[#111b31] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Describe what attendees can expect from this event."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all"
            >
              <PlusCircle size={18} />
              {saving ? 'Creating Event...' : 'Create Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
