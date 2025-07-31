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
// Create user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const user: IUser = new UserModel(req.body);
    const TUser = {email:user.email,
      name:user.name
    }
    const checkUser = await UserModel.findOne({ email:user.email });
    if(checkUser){
     return res.status(409).json({error:"User Already Exists"})
     }
    const token = jwt.sign(TUser,JWT_SECRET, { expiresIn: "7d" })
    user.password = await bcrypt.hash(user.password,10)
    const saved = await user.save();
    // Set token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS only)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
    return res.status(201).json({success:"User Created Successfully"});
  } catch (error) {
    console.log("Registration Error",error)
    return res.status(400).json({ error: (error as Error).message });
  }
});

// ✅ This only allows fetching by email
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const TUser = {
      email: user.email,
      name: user.name
    };

    const token = jwt.sign(TUser, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return res.status(200).json({ success: true, message: user.name });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/logout', (req:Request, res:Response) => {
  try{
    res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.status(200).json({ success:'Logged out successfully' });
  }
  catch(error){
  console.error("Something went wrong",error)
  return res.status(500).json({message:"Server Side Error"})
  }
});

export default router;
