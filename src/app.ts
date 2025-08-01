import * as dotenv from 'dotenv';
import express = require('express')
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import fileRoutes from "./routes/fileRoutes"
import cors from 'cors'
import cookieParser from "cookie-parser";
import { authenticateToken } from './auth';
import { limiter } from './ratelimit';
import { Request, Response } from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();

// Load environment variables
const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT || 443; // HTTPS uses port 443
const DB_URL = process.env.DB_URL;
const JWT_SECRET = process.env.JWT_SECRET;

// Check required envs
if (!BASE_URL || !DB_URL || !JWT_SECRET) {
  console.error("Missing environment variables: BASE_URL, DB_URL, or JWT_SECRET");
  process.exit(1);
}

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(limiter);
app.use(cors({
  origin: BASE_URL,
  credentials: true,
}));

// MongoDB Connection
mongoose.connect(DB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/users', userRoutes);
app.use('/files', authenticateToken, fileRoutes);

app.get("/protected", authenticateToken, (req: Request, res: Response) => {
  return res.status(200).json({ user: (req as any).user });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running securely over HTTPS' });
});

// HTTPS Server Setup
const sslOptions = {
  key: fs.readFileSync(path.join(process.cwd(), 'certs', 'privkey.pem')),
  cert: fs.readFileSync(path.join(process.cwd(), 'certs', 'fullchain.pem')),
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`);
});

