import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Mock Email Verification for Demo (since we don't have real SMTP credentials)
  app.post("/api/verify-email", async (req, res) => {
    const { email, token } = req.body;
    // In a real app, you'd verify the token in your database
    res.json({ success: true, message: "Email verified successfully!" });
  });

  // Admin Analytics Route
  app.get("/api/admin/stats", async (req, res) => {
    // This would typically fetch from Firestore using firebase-admin
    // For now, returning mock data that the frontend will replace with real Firestore data
    res.json({
      totalRegistrations: 150,
      verifiedUsers: 120,
      attendanceCount: 45
    });
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

startServer();
