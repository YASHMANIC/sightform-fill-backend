"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const model_1 = require("../models/model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
const router = express.Router();
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("JWT SECRET WAS MISSING");
    process.exit(1);
}
// Create user
router.post('/register', async (req, res) => {
    try {
        const user = new model_1.UserModel(req.body);
        const TUser = { email: user.email,
            name: user.name
        };
        const checkUser = await model_1.UserModel.findOne({ email: user.email });
        if (checkUser) {
            return res.status(409).json({ error: "User Already Exists" });
        }
        const token = jsonwebtoken_1.default.sign(TUser, JWT_SECRET, { expiresIn: "7d" });
        user.password = await bcryptjs_1.default.hash(user.password, 10);
        const saved = await user.save();
        // Set token as cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production (HTTPS only)
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(201).json({ success: "User Created Successfully" });
    }
    catch (error) {
        console.log("Registration Error", error);
        return res.status(400).json({ error: error.message });
    }
});
// ✅ This only allows fetching by email
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || typeof email !== 'string' || email.trim() === '') {
            return res.status(400).json({ error: 'Email is required' });
        }
        if (!password || typeof password !== 'string' || password.trim() === '') {
            return res.status(400).json({ error: 'Password is required' });
        }
        const user = await model_1.UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const passwordCheck = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordCheck) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const TUser = {
            email: user.email,
            name: user.name
        };
        const token = jsonwebtoken_1.default.sign(TUser, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // set to true in production with HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({ success: true, message: user.name });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return res.status(200).json({ success: 'Logged out successfully' });
    }
    catch (error) {
        console.error("Something went wrong", error);
        return res.status(500).json({ message: "Server Side Error" });
    }
});
exports.default = router;
