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
  date: string;
  venue: string;
  image: string;
  capacity: number;
  registeredCount: number;
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
    date: { type: String, required: true },
    venue: { type: String, required: true },
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
    date: new Date(Date.now() + 86400000 * 21).toISOString(),
    venue: "Tech Park, London",
    image: "https://picsum.photos/seed/cloud/800/600",
    capacity: 400,
    registeredCount: 210,
    ticketPrice: 999,
  },
];

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
  const maybeTicketPrice = (doc as unknown as { ticketPrice?: number }).ticketPrice;
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    date: doc.date,
    venue: doc.venue,
    image: doc.image,
    capacity: doc.capacity,
    registeredCount: doc.registeredCount,
    ticketPrice: typeof maybeTicketPrice === "number" ? maybeTicketPrice : 0,
    streamingProvider: doc.streamingProvider || 'none',
    streamingUrl: doc.streamingUrl || '',
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

async function startServer() {
  await connectToMongoDB();
  await seedDefaultEvents();

  const app = express();

  app.use(express.json({ limit: "8mb" }));
  app.use(cors());

  app.get("/api/health", async (_req, res) => {
    res.json({
      ok: true,
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  app.get("/api/events", async (_req, res) => {
    const events = await EventModel.find({}).sort({ date: 1 }).lean();
    res.json(events.map((event) => mapEvent(event as EventDocument)));
  });

  app.post("/api/events", async (req, res) => {
    const payload = req.body as Partial<EventDocument>;

    const title = (payload.title ?? "").trim();
    const description = (payload.description ?? "").trim();
    const venue = (payload.venue ?? "").trim();
    const image = (payload.image ?? "").trim();
    const capacity = Number(payload.capacity);
    const date = (payload.date ?? "").trim();
    const ticketPriceInput = (payload as Partial<EventDocument> & { ticketPrice?: number }).ticketPrice;
    const ticketPrice =
      ticketPriceInput === undefined || ticketPriceInput === null ? 0 : Number(ticketPriceInput);

    if (!title || !description || !venue || !date) {
      res.status(400).json({ message: "title, description, venue and date are required" });
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

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.valueOf())) {
      res.status(400).json({ message: "date must be a valid date string" });
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

    const newEvent = await EventModel.create({
      _id: createEventId(),
      title,
      description,
      date: parsedDate.toISOString(),
      venue,
      image: image || `https://picsum.photos/seed/${Date.now()}/800/600`,
      capacity,
      registeredCount: 0,
      ticketPrice: Math.round(ticketPrice * 100) / 100,
      streamingProvider,
      streamingUrl,
    });

    res.status(201).json(mapEvent(newEvent.toObject() as EventDocument));
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await EventModel.findById(req.params.id).lean();
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.json(mapEvent(event as EventDocument));
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
    const payload = req.body as Partial<RegistrationDocument>;
    const { uid, eventId, userEmail, userName } = payload;

    if (!uid || !eventId || !userEmail || !userName) {
      res.status(400).json({ message: "uid, eventId, userEmail and userName are required" });
      return;
    }

    const event = await EventModel.findById(eventId).lean();
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const registrationId = `${uid}_${eventId}`;
    const existingRegistration = await RegistrationModel.findById(registrationId).lean();
    if (existingRegistration) {
      res.status(409).json({ message: "You are already registered for this event." });
      return;
    }

    const currentCount = await RegistrationModel.countDocuments({ eventId });
    const baselineCount = Math.max(currentCount, event.registeredCount);
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

    await EventModel.findByIdAndUpdate(eventId, { registeredCount: baselineCount + 1 });

    res.status(201).json(mapRegistration(newRegistration.toObject() as RegistrationDocument));
  });

  app.post("/api/payments/initiate", async (req, res) => {
    const payload = req.body as { uid?: string; eventId?: string };
    const uid = payload.uid?.trim() ?? "";
    const eventId = payload.eventId?.trim() ?? "";

    if (!uid || !eventId) {
      res.status(400).json({ message: "uid and eventId are required" });
      return;
    }

    const event = await EventModel.findById(eventId).lean();
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const existingRegistration = await RegistrationModel.findOne({ uid, eventId }).lean();
    if (existingRegistration) {
      res.status(409).json({ message: "You are already registered for this event." });
      return;
    }

    const currentCount = await RegistrationModel.countDocuments({ eventId });
    const baselineCount = Math.max(currentCount, event.registeredCount);
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

  app.get("/api/admin/overview", async (_req, res) => {
    const [registrations, events] = await Promise.all([
      RegistrationModel.find({}).sort({ registeredAt: -1 }).lean(),
      EventModel.find({}).sort({ date: 1 }).lean(),
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
