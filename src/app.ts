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

const app = express();
dotenv.config()
const BASE_URL = process.env.BASE_URL
if(!BASE_URL){
  console.error("Base Url Not Available")
  process.exit(1)
}
app.use(express.json())
app.use(cookieParser())
app.use(limiter)
app.use(cors({
  origin: BASE_URL, // allow only this origin
  credentials: true               // allow cookies if needed
}));

const PORT = process.env.PORT || 8000;
const DB_URL = process.env.DB_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if(!DB_URL || !JWT_SECRET) {
  console.error("Missing environment variables: DB_URL or SECRET_KEY");
  process.exit(1);
}

// MongoDB connection
mongoose.connect(DB_URL)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));


app.use('/users', userRoutes);
app.use('/files',authenticateToken,fileRoutes)

app.get("/protected", authenticateToken, (req: Request, res: Response) => {
   return res.status(200).json({ user: (req as any).user });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
