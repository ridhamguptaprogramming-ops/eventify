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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT ?? 3000);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/eventify";

type UserRole = "admin" | "user";

interface UserProfileDocument {
  _id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

interface EventDocument {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  image: string;
  capacity: number;
  registeredCount: number;
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
  },
];

function mapProfile(doc: UserProfileDocument) {
  return {
    uid: doc._id,
    email: doc.email,
    displayName: doc.displayName,
    role: doc.role,
    isVerified: doc.isVerified,
    createdAt: doc.createdAt,
  };
}

function mapEvent(doc: EventDocument) {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    date: doc.date,
    venue: doc.venue,
    image: doc.image,
    capacity: doc.capacity,
    registeredCount: doc.registeredCount,
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

    if (!title || !description || !venue || !date) {
      res.status(400).json({ message: "title, description, venue and date are required" });
      return;
    }

    if (Number.isNaN(capacity) || capacity < 1) {
      res.status(400).json({ message: "capacity must be a number greater than 0" });
      return;
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.valueOf())) {
      res.status(400).json({ message: "date must be a valid date string" });
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

  // Mock Email Verification for Demo (since we don't have real SMTP credentials)
  app.post("/api/verify-email", async (req, res) => {
    const { email, token } = req.body;
    // In a real app, you'd verify the token in your database
    res.json({ success: true, message: "Email verified successfully!" });
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
