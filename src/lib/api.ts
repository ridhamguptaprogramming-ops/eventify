export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
  isVerified: boolean;
  verificationQRCode?: string;
  createdAt: string;
}

export type StreamingProvider = 'google_meet' | 'youtube' | 'zoom' | 'custom' | 'none';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  image: string;
  capacity: number;
  registeredCount: number;
  schedule?: { time: string; activity: string }[];
  speakers?: { name: string; role: string; image: string }[];
  streamingProvider?: StreamingProvider;
  streamingUrl?: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  date: string;
  venue: string;
  image?: string;
  capacity: number;
  streamingProvider?: StreamingProvider;
  streamingUrl?: string;
}

export interface Registration {
  id: string;
  uid: string;
  eventId: string;
  eventTitle: string;
  userEmail: string;
  userName: string;
  status: string;
  attended: boolean;
  registeredAt: string;
  qrCode: string;
  attendedAt?: string;
}

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

async function apiRequest<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // no-op: keep default message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getEvents() {
  return apiRequest<Event[]>("/api/events");
}

export function getEventById(id: string) {
  return apiRequest<Event>(`/api/events/${id}`);
}

export function createEvent(payload: CreateEventInput) {
  return apiRequest<Event>("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getUserProfile(uid: string) {
  return apiRequest<UserProfile>(`/api/users/${uid}/profile`);
}

export function upsertUserProfile(uid: string, profile: UserProfile) {
  return apiRequest<UserProfile>(`/api/users/${uid}/profile`, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function getRegistrations(params: { uid?: string; eventId?: string } = {}) {
  const query = new URLSearchParams();
  if (params.uid) query.set("uid", params.uid);
  if (params.eventId) query.set("eventId", params.eventId);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<Registration[]>(`/api/registrations${suffix}`);
}

export function checkRegistration(uid: string, eventId: string) {
  const query = new URLSearchParams({ uid, eventId }).toString();
  return apiRequest<{ registered: boolean; registration: Registration | null }>(
    `/api/registrations/check?${query}`
  );
}

export function createRegistration(payload: {
  uid: string;
  eventId: string;
  userEmail: string;
  userName: string;
}) {
  return apiRequest<Registration>("/api/registrations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function markRegistrationAttendance(id: string, attended = true) {
  return apiRequest<Registration>(`/api/registrations/${id}/attendance`, {
    method: "PATCH",
    body: JSON.stringify({ attended }),
  });
}

export function getAdminOverview() {
  return apiRequest<{ registrations: Registration[]; events: Event[] }>("/api/admin/overview");
}

export function getUnverifiedUsers() {
  return apiRequest<UserProfile[]>("/api/admin/users?verified=false");
}

export function getVerifiedUsers() {
  return apiRequest<UserProfile[]>("/api/admin/users?verified=true");
}

export function verifyUser(uid: string) {
  return apiRequest<UserProfile>(`/api/admin/users/${uid}/verify`, {
    method: "PATCH",
  });
}
