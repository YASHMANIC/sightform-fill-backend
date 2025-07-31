import { Request, Response } from 'express';
import express = require('express')
import {UserModel, IUser } from '../models/model';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

const router = express.Router();
dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET
if(!JWT_SECRET){
  console.error("JWT SECRET WAS MISSING")
  process.exit(1);
}

// REGISTER
router.post('/register', async (req: Request, res: Response) => {
  try {
    const user: IUser = new UserModel(req.body);

    const checkUser = await UserModel.findOne({ email: user.email });
    if (checkUser) {
      return res.status(409).json({ error: "User Already Exists" });
    }

    user.password = await bcrypt.hash(user.password, 10);
    const saved = await user.save();

    const payload = { email: saved.email, name: saved.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      success: "User Created Successfully",
      token,
      user: payload
    });
  } catch (error) {
    console.error("Registration Error", error);
    return res.status(400).json({ error: (error as Error).message });
  }
});

// LOGIN
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });
    if (!password?.trim()) return res.status(400).json({ error: 'Password is required' });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) return res.status(401).json({ error: 'Invalid Credentials' });

    const payload = { email: user.email, name: user.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: payload
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// LOGOUT (client-side should delete the token)
router.post('/logout', (req: Request, res: Response) => {
  // In header-based auth, logout is typically handled on client side
  // Optionally, you can implement token blacklisting here if needed
  return res.status(200).json({ success: 'Logged out successfully' });
});

export default router;
