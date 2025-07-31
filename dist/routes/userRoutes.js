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
// REGISTER
router.post('/register', async (req, res) => {
    try {
        const user = new model_1.UserModel(req.body);
        const checkUser = await model_1.UserModel.findOne({ email: user.email });
        if (checkUser) {
            return res.status(409).json({ error: "User Already Exists" });
        }
        user.password = await bcryptjs_1.default.hash(user.password, 10);
        const saved = await user.save();
        const payload = { email: saved.email, name: saved.name };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({
            success: "User Created Successfully",
            token,
            user: payload
        });
    }
    catch (error) {
        console.error("Registration Error", error);
        return res.status(400).json({ error: error.message });
    }
});
// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email?.trim())
            return res.status(400).json({ error: 'Email is required' });
        if (!password?.trim())
            return res.status(400).json({ error: 'Password is required' });
        const user = await model_1.UserModel.findOne({ email });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const passwordCheck = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordCheck)
            return res.status(401).json({ error: 'Invalid password' });
        const payload = { email: user.email, name: user.name };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: payload
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// LOGOUT (client-side should delete the token)
router.post('/logout', (req, res) => {
    // In header-based auth, logout is typically handled on client side
    // Optionally, you can implement token blacklisting here if needed
    return res.status(200).json({ success: 'Logged out successfully' });
});
exports.default = router;
