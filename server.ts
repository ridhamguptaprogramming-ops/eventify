import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT ?? 3000);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/eventify";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM ?? "no-reply@eventify.example.com";
const UPI_PAYEE_VPA = process.env.UPI_PAYEE_VPA ?? "";
const UPI_PAYEE_NAME = process.env.UPI_PAYEE_NAME ?? "Eventify";

type UserRole = "admin" | "user";
type EventStatus = "upcoming" | "ongoing" | "completed";

interface UserProfileDocument {
  _id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isVerified: boolean;
  verificationQRCode?: string;
  createdAt: string;
}

type StreamingProvider = 'google_meet' | 'youtube' | 'zoom' | 'custom' | 'none';

interface EventDocument {
  _id: string;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  status: EventStatus;
  attendeesCount: number;
  isHighlighted: boolean;
  statusOverride: boolean;
  // Legacy aliases maintained for backward compatibility.
  date?: string;
  venue?: string;
  image: string;
  capacity: number;
  registeredCount?: number;
  ticketPrice: number;
  streamingProvider?: StreamingProvider;
  streamingUrl?: string;
}

interface RegistrationDocument {
  _id: string;
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

const userProfileSchema = new mongoose.Schema<UserProfileDocument>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    isVerified: { type: Boolean, default: false },
    verificationQRCode: { type: String, required: false },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);

const eventSchema = new mongoose.Schema<EventDocument>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startDateTime: { type: String, required: true },
    endDateTime: { type: String, required: true },
    status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" },
    attendeesCount: { type: Number, default: 0 },
    isHighlighted: { type: Boolean, default: false },
    statusOverride: { type: Boolean, default: false },
    // Legacy aliases maintained for backward compatibility.
    date: { type: String, required: false },
    venue: { type: String, required: false },
    image: { type: String, required: true },
    capacity: { type: Number, required: true },
    registeredCount: { type: Number, default: 0 },
    ticketPrice: { type: Number, default: 0 },
    streamingProvider: {
      type: String,
      enum: ['google_meet', 'youtube', 'zoom', 'custom', 'none'],
      default: 'none',
    },
    streamingUrl: { type: String, required: false },
  },
  { versionKey: false }
);

const registrationSchema = new mongoose.Schema<RegistrationDocument>(
  {
    _id: { type: String, required: true },
    uid: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    eventTitle: { type: String, required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    status: { type: String, default: "confirmed" },
    attended: { type: Boolean, default: false },
    registeredAt: { type: String, required: true },
    qrCode: { type: String, required: true },
    attendedAt: { type: String },
  },
  { versionKey: false }
);

registrationSchema.index({ uid: 1, eventId: 1 }, { unique: true });

const UserProfileModel =
  (mongoose.models.UserProfile as mongoose.Model<UserProfileDocument>) ||
  mongoose.model<UserProfileDocument>("UserProfile", userProfileSchema);
const EventModel =
  (mongoose.models.Event as mongoose.Model<EventDocument>) ||
  mongoose.model<EventDocument>("Event", eventSchema);
const RegistrationModel =
  (mongoose.models.Registration as mongoose.Model<RegistrationDocument>) ||
  mongoose.model<RegistrationDocument>("Registration", registrationSchema);

const DEFAULT_EVENTS: EventDocument[] = [
  {
    _id: "1",
    title: "TechX 2026: The AI Revolution",
    description:
      "Join industry leaders for a deep dive into the future of artificial intelligence and its impact on society.",
    location: "Grand Innovation Hall, Silicon Valley",
    startDateTime: new Date(Date.now() + 86400000 * 7).toISOString(),
    endDateTime: new Date(Date.now() + 86400000 * 7 + 3 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
    attendeesCount: 120,
    isHighlighted: false,
    statusOverride: false,
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    venue: "Grand Innovation Hall, Silicon Valley",
    image: "https://picsum.photos/seed/tech/800/600",
    capacity: 500,
    registeredCount: 120,
    ticketPrice: 799,
  },
  {
    _id: "2",
    title: "Design Systems Summit",
    description:
      "A gathering of world-class designers to discuss the evolution of design systems and user experience.",
    location: "The Creative Hub, New York",
    startDateTime: new Date(Date.now() + 86400000 * 14).toISOString(),
    endDateTime: new Date(Date.now() + 86400000 * 14 + 3 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
    attendeesCount: 85,
    isHighlighted: false,
    statusOverride: false,
    date: new Date(Date.now() + 86400000 * 14).toISOString(),
    venue: "The Creative Hub, New York",
    image: "https://picsum.photos/seed/design/800/600",
    capacity: 300,
    registeredCount: 85,
    ticketPrice: 499,
  },
  {
    _id: "3",
    title: "Cloud Native Day",
    description:
      "Everything you need to know about Kubernetes, serverless, and the modern cloud infrastructure.",
    location: "Tech Park, London",
    startDateTime: new Date(Date.now() + 86400000 * 21).toISOString(),
    endDateTime: new Date(Date.now() + 86400000 * 21 + 3 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
    attendeesCount: 210,
    isHighlighted: true,
    statusOverride: false,
    date: new Date(Date.now() + 86400000 * 21).toISOString(),
    venue: "Tech Park, London",
    image: "https://picsum.photos/seed/cloud/800/600",
    capacity: 400,
    registeredCount: 210,
    ticketPrice: 999,
  },
];

const MIN_EVENT_DURATION_MS = 2 * 60 * 60 * 1000;
const MAX_EVENT_DURATION_MS = 4 * 60 * 60 * 1000;
const FALLBACK_EVENT_DURATION_MS = 3 * 60 * 60 * 1000;

function getDefaultEventDurationMs() {
  const configured = Number(process.env.DEFAULT_EVENT_DURATION_MS ?? FALLBACK_EVENT_DURATION_MS);
  if (!Number.isFinite(configured)) {
    return FALLBACK_EVENT_DURATION_MS;
  }
  return Math.min(Math.max(configured, MIN_EVENT_DURATION_MS), MAX_EVENT_DURATION_MS);
}

function parseDateInput(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function resolveEventWindow(input: {
  startDateTime?: string;
  endDateTime?: string;
  date?: string;
  fallbackStartDateTime?: string;
  fallbackEndDateTime?: string;
}) {
  const now = new Date();
  const start =
    parseDateInput(input.startDateTime) ||
    parseDateInput(input.date) ||
    parseDateInput(input.fallbackStartDateTime) ||
    now;
  const defaultEnd = new Date(start.getTime() + getDefaultEventDurationMs());
  const parsedEnd = parseDateInput(input.endDateTime) || parseDateInput(input.fallbackEndDateTime);
  const end = parsedEnd && parsedEnd.getTime() > start.getTime() ? parsedEnd : defaultEnd;

  return {
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
  };
}

function deriveEventStatus(now: Date, startDateTime: Date, endDateTime: Date): EventStatus {
  if (now.getTime() < startDateTime.getTime()) {
    return "upcoming";
  }
  if (now.getTime() <= endDateTime.getTime()) {
    return "ongoing";
  }
  return "completed";
}

function normalizeEventState(doc: EventDocument, now = new Date()) {
  const location = (doc.location ?? doc.venue ?? "").trim() || "Location TBA";
  const { startDateTime, endDateTime } = resolveEventWindow({
    startDateTime: doc.startDateTime,
    endDateTime: doc.endDateTime,
    date: doc.date,
  });

  const parsedStart = new Date(startDateTime);
  const parsedEnd = new Date(endDateTime);
  const autoStatus = deriveEventStatus(now, parsedStart, parsedEnd);
  const statusOverride = Boolean((doc as Partial<EventDocument>).statusOverride);
  const resolvedStatus = statusOverride ? doc.status ?? autoStatus : autoStatus;

  const attendeesCount =
    typeof doc.attendeesCount === "number"
      ? doc.attendeesCount
      : typeof doc.registeredCount === "number"
        ? doc.registeredCount
        : 0;
  const registeredCount =
    typeof doc.registeredCount === "number" ? doc.registeredCount : attendeesCount;
  const isHighlighted = Boolean(doc.isHighlighted);

  const patch: Partial<EventDocument> = {};
  if (doc.location !== location) patch.location = location;
  if (doc.startDateTime !== startDateTime) patch.startDateTime = startDateTime;
  if (doc.endDateTime !== endDateTime) patch.endDateTime = endDateTime;
  if (doc.date !== startDateTime) patch.date = startDateTime;
  if (doc.venue !== location) patch.venue = location;
  if (doc.status !== resolvedStatus) patch.status = resolvedStatus;
  if (doc.statusOverride !== statusOverride) patch.statusOverride = statusOverride;
  if (doc.attendeesCount !== attendeesCount) patch.attendeesCount = attendeesCount;
  if (doc.registeredCount !== registeredCount) patch.registeredCount = registeredCount;
  if (doc.isHighlighted !== isHighlighted) patch.isHighlighted = isHighlighted;

  return {
    patch,
    normalized: {
      ...doc,
      location,
      startDateTime,
      endDateTime,
      status: resolvedStatus,
      statusOverride,
      attendeesCount,
      registeredCount,
      isHighlighted,
      date: startDateTime,
      venue: location,
    } satisfies EventDocument,
  };
}

function mapProfile(doc: UserProfileDocument) {
  return {
    uid: doc._id,
    email: doc.email,
    displayName: doc.displayName,
    role: doc.role,
    isVerified: doc.isVerified,
    verificationQRCode: (doc as unknown as { verificationQRCode?: string }).verificationQRCode,
    createdAt: doc.createdAt,
  };
}

function mapEvent(doc: EventDocument) {
  const { normalized } = normalizeEventState(doc);
  const maybeTicketPrice = (normalized as unknown as { ticketPrice?: number }).ticketPrice;
  return {
    id: normalized._id,
    title: normalized.title,
    description: normalized.description,
    location: normalized.location,
    startDateTime: normalized.startDateTime,
    endDateTime: normalized.endDateTime,
    status: normalized.status,
    attendeesCount: normalized.attendeesCount,
    isHighlighted: normalized.isHighlighted,
    // Legacy aliases for existing frontend compatibility.
    date: normalized.startDateTime,
    venue: normalized.location,
    image: normalized.image,
    capacity: normalized.capacity,
    registeredCount: normalized.attendeesCount,
    ticketPrice: typeof maybeTicketPrice === "number" ? maybeTicketPrice : 0,
    streamingProvider: normalized.streamingProvider || "none",
    streamingUrl: normalized.streamingUrl || "",
  };
}

function createEventId() {
  return new mongoose.Types.ObjectId().toString();
}

function mapRegistration(doc: RegistrationDocument) {
  return {
    id: doc._id,
    uid: doc.uid,
    eventId: doc.eventId,
    eventTitle: doc.eventTitle,
    userEmail: doc.userEmail,
    userName: doc.userName,
    status: doc.status,
    attended: doc.attended,
    registeredAt: doc.registeredAt,
    qrCode: doc.qrCode,
    attendedAt: doc.attendedAt,
  };
}

async function createMailTransporter() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  console.info("Using ethereal email for verification notifications:", testAccount.user);

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function sendVerificationEmail(email: string, displayName: string, qrValue: string) {
  const transporter = await createMailTransporter();
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`;

  const subject = "Your Eventify verification is complete";
  const text = `Hello ${displayName || "user"},\n\nYour account is now officially verified.\n\nVerification code: ${qrValue}\n\nUse this QR code to access your verified services or entry tickets.\n\nThank you!`;
  const html = `
    <p>Hello ${displayName || "user"},</p>
    <p>Your account is now officially <strong>verified</strong>.</p>
    <p>QR data: <code>${qrValue}</code></p>
    <p><img src="${qrImageUrl}" alt="Verification QR code" style="max-width: 300px;"/></p>
    <p>Save this message for your records and use the QR code when required.</p>
    <p>Thanks,<br/>Eventify Team</p>
  `;

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    text,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.info("Verification email preview URL: ", previewUrl);
  }

  return info;
}

async function sendVerificationReminderEmail(email: string, displayName: string, qrValue: string) {
  const transporter = await createMailTransporter();
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`;

  const subject = "Eventify verification reminder";
  const text = `Hello ${displayName || "user"},\n\nYour account is still pending verification.\n\nVerification code: ${qrValue}\n\nPlease keep this code ready and contact your event administrator for approval.\n\nThank you!`;
  const html = `
    <p>Hello ${displayName || "user"},</p>
    <p>Your account is currently <strong>pending verification</strong>.</p>
    <p>Verification code: <code>${qrValue}</code></p>
    <p><img src="${qrImageUrl}" alt="Verification QR code" style="max-width: 300px;"/></p>
    <p>Please keep this code ready and contact your event administrator for approval.</p>
    <p>Thanks,<br/>Eventify Team</p>
  `;

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    text,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.info("Verification reminder email preview URL: ", previewUrl);
  }

  return info;
}

async function connectToMongoDB() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB at ${MONGODB_URI}`);
}

async function seedDefaultEvents() {
  const count = await EventModel.countDocuments();
  if (count === 0) {
    await EventModel.insertMany(DEFAULT_EVENTS);
    console.log("Seeded default events into MongoDB.");
  }
}

async function syncEventStatuses() {
  const events = await EventModel.find({}).lean();
  if (events.length === 0) {
    return { checked: 0, updated: 0 };
  }

  const operations: mongoose.AnyBulkWriteOperation<EventDocument>[] = [];
  for (const rawEvent of events) {
    const event = rawEvent as EventDocument;
    const { patch } = normalizeEventState(event);
    if (Object.keys(patch).length === 0) {
      continue;
    }
    operations.push({
      updateOne: {
        filter: { _id: event._id },
        update: { $set: patch },
      },
    });
  }

  if (operations.length === 0) {
    return { checked: events.length, updated: 0 };
  }

  const result = await EventModel.bulkWrite(operations);
  return {
    checked: events.length,
    updated: result.modifiedCount ?? 0,
  };
}

async function startServer() {
  await connectToMongoDB();
  await seedDefaultEvents();
  await syncEventStatuses();

  const app = express();
  const statusSyncIntervalMs = Number(process.env.EVENT_STATUS_SYNC_MS ?? 60_000);
  const safeStatusSyncIntervalMs =
    Number.isFinite(statusSyncIntervalMs) && statusSyncIntervalMs > 0 ? statusSyncIntervalMs : 60_000;
  const statusSyncTimer = setInterval(() => {
    void syncEventStatuses().catch((error) => {
      console.error("Failed to sync event statuses:", error);
    });
  }, safeStatusSyncIntervalMs);
  statusSyncTimer.unref();

  app.use(express.json({ limit: "8mb" }));
  app.use(cors());

  app.get("/api/health", async (_req, res) => {
    res.json({
      ok: true,
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  app.get("/api/events", async (_req, res) => {
    await syncEventStatuses();
    const events = await EventModel.find({}).sort({ startDateTime: 1, date: 1 }).lean();
    res.json(events.map((event) => mapEvent(event as EventDocument)));
  });

  app.post("/api/events", async (req, res) => {
    const payload = req.body as Partial<EventDocument>;

    const title = (payload.title ?? "").trim();
    const description = (payload.description ?? "").trim();
    const location = (payload.location ?? payload.venue ?? "").trim();
    const image = (payload.image ?? "").trim();
    const capacity = Number(payload.capacity);
    const startDateTimeInput = (payload.startDateTime ?? payload.date ?? "").trim();
    const endDateTimeInput = (payload.endDateTime ?? "").trim();
    const ticketPriceInput = (payload as Partial<EventDocument> & { ticketPrice?: number }).ticketPrice;
    const ticketPrice =
      ticketPriceInput === undefined || ticketPriceInput === null ? 0 : Number(ticketPriceInput);
    const rawAttendeesCount =
      (payload as Partial<EventDocument> & { attendeesCount?: number; registeredCount?: number })
        .attendeesCount ??
      (payload as Partial<EventDocument> & { attendeesCount?: number; registeredCount?: number })
        .registeredCount ??
      0;
    const attendeesCount = Number(rawAttendeesCount);
    const isHighlighted = Boolean(payload.isHighlighted);

    if (!title || !description || !location || !startDateTimeInput) {
      res.status(400).json({ message: "title, description, location and startDateTime are required" });
      return;
    }

    if (Number.isNaN(capacity) || capacity < 1) {
      res.status(400).json({ message: "capacity must be a number greater than 0" });
      return;
    }

    if (Number.isNaN(ticketPrice) || ticketPrice < 0) {
      res.status(400).json({ message: "ticketPrice must be a number greater than or equal to 0" });
      return;
    }

    if (Number.isNaN(attendeesCount) || attendeesCount < 0) {
      res.status(400).json({ message: "attendeesCount must be a non-negative number" });
      return;
    }

    const { startDateTime, endDateTime } = resolveEventWindow({
      startDateTime: startDateTimeInput,
      endDateTime: endDateTimeInput,
    });
    const parsedStartDateTime = new Date(startDateTime);
    if (Number.isNaN(parsedStartDateTime.valueOf())) {
      res.status(400).json({ message: "startDateTime must be a valid date string" });
      return;
    }

    const streamingProvider =
      payload.streamingProvider && ['google_meet', 'youtube', 'zoom', 'custom', 'none'].includes(payload.streamingProvider)
        ? (payload.streamingProvider as StreamingProvider)
        : 'none';
    const streamingUrl = (payload.streamingUrl ?? '').trim();

    if (streamingProvider !== 'none' && streamingUrl && !/^https?:\/\//i.test(streamingUrl)) {
      res.status(400).json({ message: 'streamingUrl must be a valid HTTP/HTTPS URL' });
      return;
    }

    const providedStatus = payload.status;
    const shouldOverrideStatus = Boolean(
      providedStatus && ["upcoming", "ongoing", "completed"].includes(providedStatus)
    );
    const autoStatus = deriveEventStatus(new Date(), parsedStartDateTime, new Date(endDateTime));
    const status = shouldOverrideStatus ? (providedStatus as EventStatus) : autoStatus;

    const newEvent = await EventModel.create({
      _id: createEventId(),
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      status,
      statusOverride: shouldOverrideStatus,
      attendeesCount,
      isHighlighted,
      date: startDateTime,
      venue: location,
      image: image || `https://picsum.photos/seed/${Date.now()}/800/600`,
      capacity,
      registeredCount: attendeesCount,
      ticketPrice: Math.round(ticketPrice * 100) / 100,
      streamingProvider,
      streamingUrl,
    });

    res.status(201).json(mapEvent(newEvent.toObject() as EventDocument));
  });

  app.get("/api/events/:id", async (req, res) => {
    await syncEventStatuses();
    const event = await EventModel.findById(req.params.id).lean();
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.json(mapEvent(event as EventDocument));
  });

  app.put("/api/events/:id", async (req, res) => {
    const payload = req.body as Partial<EventDocument>;
    const existing = await EventModel.findById(req.params.id).lean();

    if (!existing) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const normalizedExisting = normalizeEventState(existing as EventDocument).normalized;
    const title = (payload.title ?? existing.title ?? "").trim();
    const description = (payload.description ?? existing.description ?? "").trim();
    const location = (payload.location ?? payload.venue ?? normalizedExisting.location ?? "").trim();
    const image = (payload.image ?? existing.image ?? "").trim();
    const startDateTimeInput = (
      payload.startDateTime ??
      payload.date ??
      normalizedExisting.startDateTime
    ).trim();
    const endDateTimeInput = (
      payload.endDateTime ?? normalizedExisting.endDateTime
    ).trim();
    const capacity =
      payload.capacity === undefined || payload.capacity === null
        ? Number(existing.capacity)
        : Number(payload.capacity);
    const ticketPriceInput =
      (payload as Partial<EventDocument> & { ticketPrice?: number }).ticketPrice ?? existing.ticketPrice ?? 0;
    const ticketPrice = Number(ticketPriceInput);
    const rawAttendeesCount =
      (payload as Partial<EventDocument> & { attendeesCount?: number; registeredCount?: number })
        .attendeesCount ??
      (payload as Partial<EventDocument> & { attendeesCount?: number; registeredCount?: number })
        .registeredCount ??
      normalizedExisting.attendeesCount;
    const attendeesCount = Number(rawAttendeesCount);
    const isHighlighted =
      payload.isHighlighted === undefined ? normalizedExisting.isHighlighted : Boolean(payload.isHighlighted);
    const clearStatusOverride = Boolean(
      (payload as Partial<EventDocument> & { clearStatusOverride?: boolean }).clearStatusOverride
    );

    if (!title || !description || !location || !startDateTimeInput) {
      res.status(400).json({ message: "title, description, location and startDateTime are required" });
      return;
    }

    if (Number.isNaN(capacity) || capacity < 1) {
      res.status(400).json({ message: "capacity must be a number greater than 0" });
      return;
    }

    if (Number.isNaN(ticketPrice) || ticketPrice < 0) {
      res.status(400).json({ message: "ticketPrice must be a number greater than or equal to 0" });
      return;
    }

    if (Number.isNaN(attendeesCount) || attendeesCount < 0) {
      res.status(400).json({ message: "attendeesCount must be a non-negative number" });
      return;
    }

    const { startDateTime, endDateTime } = resolveEventWindow({
      startDateTime: startDateTimeInput,
      endDateTime: endDateTimeInput,
      fallbackStartDateTime: normalizedExisting.startDateTime,
      fallbackEndDateTime: normalizedExisting.endDateTime,
    });
    const parsedStartDateTime = new Date(startDateTime);
    if (Number.isNaN(parsedStartDateTime.valueOf())) {
      res.status(400).json({ message: "startDateTime must be a valid date string" });
      return;
    }

    const streamingProvider =
      payload.streamingProvider && ['google_meet', 'youtube', 'zoom', 'custom', 'none'].includes(payload.streamingProvider)
        ? (payload.streamingProvider as StreamingProvider)
        : existing.streamingProvider || 'none';
    const streamingUrl =
      (payload.streamingUrl ?? existing.streamingUrl ?? "").trim();

    if (streamingProvider !== 'none' && streamingUrl && !/^https?:\/\//i.test(streamingUrl)) {
      res.status(400).json({ message: 'streamingUrl must be a valid HTTP/HTTPS URL' });
      return;
    }

    const now = new Date();
    const providedStatus = payload.status;
    const validProvidedStatus =
      providedStatus && ["upcoming", "ongoing", "completed"].includes(providedStatus)
        ? (providedStatus as EventStatus)
        : undefined;

    const autoStatus = deriveEventStatus(now, parsedStartDateTime, new Date(endDateTime));
    const statusOverride =
      clearStatusOverride
        ? false
        : validProvidedStatus
          ? true
          : normalizedExisting.statusOverride;
    const status = statusOverride
      ? validProvidedStatus ?? normalizedExisting.status
      : autoStatus;

    const updated = await EventModel.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        location,
        image: image || "https://picsum.photos/seed/event/800/600",
        startDateTime,
        endDateTime,
        status,
        statusOverride,
        attendeesCount,
        isHighlighted,
        date: startDateTime,
        venue: location,
        capacity,
        registeredCount: attendeesCount,
        ticketPrice: Math.round(ticketPrice * 100) / 100,
        streamingProvider,
        streamingUrl: streamingProvider === 'none' ? '' : streamingUrl,
      },
      { new: true }
    ).lean();

    res.json(mapEvent(updated as EventDocument));
  });

  app.patch("/api/events/:id/mark-completed", async (req, res) => {
    const existing = await EventModel.findById(req.params.id).lean();
    if (!existing) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const normalizedExisting = normalizeEventState(existing as EventDocument).normalized;
    const nowIso = new Date().toISOString();
    const endDateTime =
      new Date(normalizedExisting.endDateTime).getTime() > Date.now()
        ? nowIso
        : normalizedExisting.endDateTime;

    const updated = await EventModel.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        statusOverride: true,
        endDateTime,
      },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.json(mapEvent(updated as EventDocument));
  });

  app.delete("/api/events/:id", async (req, res) => {
    const deletedEvent = await EventModel.findByIdAndDelete(req.params.id).lean();

    if (!deletedEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    await RegistrationModel.deleteMany({ eventId: req.params.id });

    res.json(mapEvent(deletedEvent as EventDocument));
  });

  app.get("/api/users/:uid/profile", async (req, res) => {
    const profile = await UserProfileModel.findById(req.params.uid).lean();
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.json(mapProfile(profile as UserProfileDocument));
  });

  app.put("/api/users/:uid/profile", async (req, res) => {
    const payload = req.body as Partial<UserProfileDocument>;
    const profile = await UserProfileModel.findByIdAndUpdate(
      req.params.uid,
      {
        _id: req.params.uid,
        email: payload.email ?? "",
        displayName: payload.displayName ?? "",
        role: payload.role ?? "user",
        isVerified: payload.isVerified ?? false,
        verificationQRCode: (payload as unknown as { verificationQRCode?: string }).verificationQRCode,
        createdAt: payload.createdAt ?? new Date().toISOString(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json(mapProfile(profile as UserProfileDocument));
  });

  app.get("/api/registrations", async (req, res) => {
    const uid = typeof req.query.uid === "string" ? req.query.uid : undefined;
    const eventId = typeof req.query.eventId === "string" ? req.query.eventId : undefined;

    const filter: { uid?: string; eventId?: string } = {};
    if (uid) filter.uid = uid;
    if (eventId) filter.eventId = eventId;

    const registrations = await RegistrationModel.find(filter)
      .sort({ registeredAt: -1 })
      .lean();
    res.json(registrations.map((registration) => mapRegistration(registration as RegistrationDocument)));
  });

  app.get("/api/registrations/check", async (req, res) => {
    const uid = typeof req.query.uid === "string" ? req.query.uid : "";
    const eventId = typeof req.query.eventId === "string" ? req.query.eventId : "";

    if (!uid || !eventId) {
      res.status(400).json({ message: "uid and eventId are required" });
      return;
    }

    const registration = await RegistrationModel.findOne({ uid, eventId }).lean();
    res.json({
      registered: Boolean(registration),
      registration: registration ? mapRegistration(registration as RegistrationDocument) : null,
    });
  });

  app.post("/api/registrations", async (req, res) => {
    await syncEventStatuses();
    const payload = req.body as Partial<RegistrationDocument>;
    const { uid, eventId, userEmail, userName } = payload;

    if (!uid || !eventId || !userEmail || !userName) {
      res.status(400).json({ message: "uid, eventId, userEmail and userName are required" });
      return;
    }

    const rawEvent = await EventModel.findById(eventId).lean();
    if (!rawEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    const event = normalizeEventState(rawEvent as EventDocument).normalized;
    if (event.status === "completed") {
      res.status(409).json({ message: "This event has ended." });
      return;
    }

    const registrationId = `${uid}_${eventId}`;
    const existingRegistration = await RegistrationModel.findById(registrationId).lean();
    if (existingRegistration) {
      res.status(409).json({ message: "You are already registered for this event." });
      return;
    }

    const currentCount = await RegistrationModel.countDocuments({ eventId });
    const baselineCount = Math.max(currentCount, event.attendeesCount);
    if (baselineCount >= event.capacity) {
      res.status(409).json({ message: "This event is full." });
      return;
    }

    const newRegistration = await RegistrationModel.create({
      _id: registrationId,
      uid,
      eventId,
      eventTitle: event.title,
      userEmail,
      userName,
      status: payload.status ?? "confirmed",
      attended: false,
      registeredAt: new Date().toISOString(),
      qrCode: payload.qrCode ?? registrationId,
    });

    await EventModel.findByIdAndUpdate(eventId, {
      attendeesCount: baselineCount + 1,
      registeredCount: baselineCount + 1,
    });

    res.status(201).json(mapRegistration(newRegistration.toObject() as RegistrationDocument));
  });

  app.delete("/api/registrations/:id", async (req, res) => {
    const deleted = await RegistrationModel.findByIdAndDelete(req.params.id).lean();

    if (!deleted) {
      res.status(404).json({ message: "Registration not found" });
      return;
    }

    const remainingRegistrations = await RegistrationModel.countDocuments({ eventId: deleted.eventId });
    await EventModel.findByIdAndUpdate(deleted.eventId, {
      attendeesCount: Math.max(remainingRegistrations, 0),
      registeredCount: Math.max(remainingRegistrations, 0),
    });

    res.json(mapRegistration(deleted as RegistrationDocument));
  });

  app.post("/api/payments/initiate", async (req, res) => {
    await syncEventStatuses();
    const payload = req.body as { uid?: string; eventId?: string };
    const uid = payload.uid?.trim() ?? "";
    const eventId = payload.eventId?.trim() ?? "";

    if (!uid || !eventId) {
      res.status(400).json({ message: "uid and eventId are required" });
      return;
    }

    const rawEvent = await EventModel.findById(eventId).lean();
    if (!rawEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    const event = normalizeEventState(rawEvent as EventDocument).normalized;
    if (event.status === "completed") {
      res.status(409).json({ message: "This event has ended." });
      return;
    }

    const existingRegistration = await RegistrationModel.findOne({ uid, eventId }).lean();
    if (existingRegistration) {
      res.status(409).json({ message: "You are already registered for this event." });
      return;
    }

    const currentCount = await RegistrationModel.countDocuments({ eventId });
    const baselineCount = Math.max(currentCount, event.attendeesCount);
    if (baselineCount >= event.capacity) {
      res.status(409).json({ message: "This event is full." });
      return;
    }

    const ticketPrice =
      typeof (event as unknown as { ticketPrice?: number }).ticketPrice === "number"
        ? (event as unknown as { ticketPrice: number }).ticketPrice
        : 0;

    if (ticketPrice <= 0) {
      res.json({
        requiresPayment: false,
        message: "This event is free. You can register without payment.",
      });
      return;
    }

    if (!UPI_PAYEE_VPA) {
      res.status(500).json({
        message:
          "UPI payment is not configured. Set UPI_PAYEE_VPA in server environment variables.",
      });
      return;
    }

    const amount = Number(ticketPrice.toFixed(2));
    const transactionRef = `EVT${Date.now()}${crypto.randomInt(100, 999)}`;
    const transactionNote = `Eventify - ${event.title}`.slice(0, 80);
    const upiParams = new URLSearchParams({
      pa: UPI_PAYEE_VPA,
      pn: UPI_PAYEE_NAME,
      tr: transactionRef,
      tn: transactionNote,
      am: amount.toFixed(2),
      cu: "INR",
    });
    const upiIntentUrl = `upi://pay?${upiParams.toString()}`;

    res.json({
      requiresPayment: true,
      eventId: event._id,
      eventTitle: event.title,
      amount,
      currency: "INR",
      transactionRef,
      upiPayeeName: UPI_PAYEE_NAME,
      upiPayeeVpa: UPI_PAYEE_VPA,
      upiIntentUrl,
      qrPayload: upiIntentUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  });

  app.patch("/api/registrations/:id/attendance", async (req, res) => {
    const attended = Boolean((req.body as { attended?: boolean }).attended ?? true);

    const updated = await RegistrationModel.findByIdAndUpdate(
      req.params.id,
      {
        attended,
        attendedAt: attended ? new Date().toISOString() : undefined,
      },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ message: "Registration not found" });
      return;
    }

    res.json(mapRegistration(updated as RegistrationDocument));
  });

  app.get("/api/admin/users", async (req, res) => {
    const verifiedQuery = typeof req.query.verified === "string" ? req.query.verified : undefined;
    const filter: { isVerified?: boolean } = {};

    if (verifiedQuery === "true") {
      filter.isVerified = true;
    }

    if (verifiedQuery === "false") {
      filter.isVerified = false;
    }

    const users = await UserProfileModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json(users.map((user) => mapProfile(user as UserProfileDocument)));
  });

  app.patch("/api/admin/users/:uid/verify", async (req, res) => {
    const qrValue = `verification:${req.params.uid}:${Date.now()}`;
    const updatedUser = await UserProfileModel.findByIdAndUpdate(
      req.params.uid,
      { isVerified: true, verificationQRCode: qrValue },
      { new: true }
    ).lean();

    if (!updatedUser) {
      res.status(404).json({ message: "User profile not found" });
      return;
    }

    try {
      await sendVerificationEmail(updatedUser.email, updatedUser.displayName, qrValue);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Continue to return success for verification, but inform in response.
      return res.status(200).json({
        ...mapProfile(updatedUser as UserProfileDocument),
        warning: "User verified, but email notification failed.",
      });
    }

    res.json({
      ...mapProfile(updatedUser as UserProfileDocument),
      verificationQRCode: qrValue,
      message: "User verified and notification email sent.",
    });
  });

  app.post("/api/admin/users/:uid/resend-verification", async (req, res) => {
    const user = await UserProfileModel.findById(req.params.uid).lean();

    if (!user) {
      res.status(404).json({ message: "User profile not found" });
      return;
    }

    const qrValue = user.verificationQRCode ?? `pending-verification:${req.params.uid}:${Date.now()}`;

    let updatedUser = user as unknown as UserProfileDocument;
    if (!user.verificationQRCode) {
      const saved = await UserProfileModel.findByIdAndUpdate(
        req.params.uid,
        { verificationQRCode: qrValue },
        { new: true }
      ).lean();
      if (saved) {
        updatedUser = saved as unknown as UserProfileDocument;
      }
    }

    try {
      await sendVerificationReminderEmail(updatedUser.email, updatedUser.displayName, qrValue);
    } catch (error) {
      console.error("Failed to send verification reminder email:", error);
      res.status(500).json({ message: "Failed to send verification reminder email." });
      return;
    }

    res.json({
      ...mapProfile(updatedUser as UserProfileDocument),
      verificationQRCode: qrValue,
      message: "Verification reminder email sent.",
    });
  });

  app.patch("/api/admin/users/:uid/deactivate", async (req, res) => {
    const updatedUser = await UserProfileModel.findByIdAndUpdate(
      req.params.uid,
      {
        role: "user",
        isVerified: false,
        $unset: { verificationQRCode: 1 },
      } as any,
      { new: true }
    ).lean();

    if (!updatedUser) {
      res.status(404).json({ message: "User profile not found" });
      return;
    }

    res.json({
      ...mapProfile(updatedUser as UserProfileDocument),
      message: "User deactivated successfully.",
    });
  });

  app.get("/api/admin/overview", async (_req, res) => {
    await syncEventStatuses();
    const [registrations, events] = await Promise.all([
      RegistrationModel.find({}).sort({ registeredAt: -1 }).lean(),
      EventModel.find({}).sort({ startDateTime: 1, date: 1 }).lean(),
    ]);

    res.json({
      registrations: registrations.map((registration) =>
        mapRegistration(registration as RegistrationDocument)
      ),
      events: events.map((event) => mapEvent(event as EventDocument)),
    });
  });

  // Verify email endpoint (mock for demo)
  app.post("/api/verify-email", async (req, res) => {
    const { email, token } = req.body;
    // In a real app, you'd verify the token in your database
    const qrValue = `verification:${email}:${Date.now()}`;
    try {
      await sendVerificationEmail(email, email, qrValue);
      res.json({ success: true, message: "Email verified successfully!", verificationQRCode: qrValue });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      res.status(500).json({ success: false, message: "Email verified but notification failed." });
    }
  });

  // Admin Analytics Route
  app.get("/api/admin/stats", async (req, res) => {
    const [totalRegistrations, verifiedUsers, attendanceCount] = await Promise.all([
      RegistrationModel.countDocuments(),
      UserProfileModel.countDocuments({ isVerified: true }),
      RegistrationModel.countDocuments({ attended: true }),
    ]);

    res.json({ totalRegistrations, verifiedUsers, attendanceCount });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
