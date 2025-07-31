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
const dotenv = __importStar(require("dotenv"));
const express = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./auth");
const ratelimit_1 = require("./ratelimit");
const app = express();
dotenv.config();
const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) {
    console.error("Base Url Not Available");
    process.exit(1);
}
console.log(BASE_URL);
app.use(express.json());
app.use((0, cookie_parser_1.default)());
app.use(ratelimit_1.limiter);
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // allow only this origin
    credentials: true // allow cookies if needed
}));
const PORT = process.env.PORT || 8000;
const DB_URL = process.env.DB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
if (!DB_URL || !JWT_SECRET) {
    console.error("Missing environment variables: DB_URL or SECRET_KEY");
    process.exit(1);
}
// MongoDB connection
mongoose_1.default.connect(DB_URL)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.use('/users', userRoutes_1.default);
app.use('/files', auth_1.authenticateToken, fileRoutes_1.default);
app.get("/protected", auth_1.authenticateToken, (req, res) => {
    return res.status(200).json({ user: req.user });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
