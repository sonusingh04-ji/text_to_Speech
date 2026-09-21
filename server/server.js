import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { testDatabaseConnection } from "./config/database.js";

import adminRoutes from "./routes/adminRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import ttsRoutes from "./routes/ttsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import usageRoutes from "./routes/usageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const PORT = Number(process.env.PORT) || 5050;

/*
|--------------------------------------------------------------------------
| Startup Configuration Logging
|--------------------------------------------------------------------------
*/

console.log(
    "DAILY_CHARACTER_LIMIT:",
    process.env.DAILY_CHARACTER_LIMIT || "2000000"
);

console.log(
    "DAILY_REQUEST_LIMIT:",
    process.env.DAILY_REQUEST_LIMIT || "2000"
);

console.log(
    "CLIENT_URL:",
    process.env.CLIENT_URL || "http://localhost:5173"
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [
        "http://localhost:5173",
        "http://localhost:5174",
    ];

app.use(
    cors({
        origin: allowedOrigins,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

/*
|--------------------------------------------------------------------------
| Security Headers
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(
    express.json({
        limit: "1mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb",
    })
);

/*
|--------------------------------------------------------------------------
| General API Rate Limiter
|--------------------------------------------------------------------------
*/

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    // Development-friendly limit while still protecting the API.
    max: 300,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    skip: (req) => {
        /*
         * Authentication has its own dedicated limiter.
         *
         * When mounted under /api, req.path for:
         * /api/auth/login
         * becomes:
         * /auth/login
         */
        return req.path.startsWith("/auth");
    },

    message: {
        success: false,

        message:
            "Too many API requests. Please try again later.",

        code:
            "RATE_LIMIT_EXCEEDED",
    },
});

/*
|--------------------------------------------------------------------------
| Authentication Rate Limiter
|--------------------------------------------------------------------------
|
| Login/register/password-reset requests are protected separately.
|--------------------------------------------------------------------------
*/

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    // Allows normal development/testing while preventing abuse.
    max: 30,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,

        message:
            "Too many authentication attempts. Please try again later.",

        code:
            "AUTH_RATE_LIMITED",
    },
});

/*
|--------------------------------------------------------------------------
| Root Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,

        message:
            "Text-to-Speech API is running",

        version:
            "1.0.0",
    });
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
|
| Authentication gets its own rate limiter.
|--------------------------------------------------------------------------
*/

app.use(
    "/api/auth",
    authLimiter,
    authRoutes
);

/*
|--------------------------------------------------------------------------
| General API Rate Limiting
|--------------------------------------------------------------------------
|
| This applies to the remaining /api routes.
| /api/auth is skipped by apiLimiter.
|--------------------------------------------------------------------------
*/

app.use(
    "/api",
    apiLimiter
);

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.use(
    "/api/health",
    healthRoutes
);

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

app.use(
    "/api/profile",
    profileRoutes
);

/*
|--------------------------------------------------------------------------
| Text-to-Speech
|--------------------------------------------------------------------------
*/

app.use(
    "/api",
    ttsRoutes
);

/*
|--------------------------------------------------------------------------
| Speech History
|--------------------------------------------------------------------------
*/

app.use(
    "/api/history",
    historyRoutes
);

/*
|--------------------------------------------------------------------------
| Favorites
|--------------------------------------------------------------------------
*/

app.use(
    "/api/favorites",
    favoriteRoutes
);

/*
|--------------------------------------------------------------------------
| File Upload
|--------------------------------------------------------------------------
*/

app.use(
    "/api/files",
    fileRoutes
);

/*
|--------------------------------------------------------------------------
| Usage
|--------------------------------------------------------------------------
*/

app.use(
    "/api/usage",
    usageRoutes
);

/*
|--------------------------------------------------------------------------
| AI
|--------------------------------------------------------------------------
*/

app.use(
    "/api/ai",
    aiRoutes
);

/*
|--------------------------------------------------------------------------
| Translation
|--------------------------------------------------------------------------
*/

app.use(
    "/api/translate",
    translationRoutes
);

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

app.use(
    "/api/admin",
    adminRoutes
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
    return res.status(404).json({
        success: false,

        message:
            `Route ${req.method} ${req.originalUrl} not found`,

        code:
            "ROUTE_NOT_FOUND",
    });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
    errorHandler
);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const startServer = async () => {
    try {
        await testDatabaseConnection();

        app.listen(
            PORT,
            () => {
                console.log(
                    "======================================"
                );

                console.log(
                    " Text-to-Speech Backend Started"
                );

                console.log(
                    "======================================"
                );

                console.log(
                    `Server: http://localhost:${PORT}`
                );

                console.log(
                    `Health: http://localhost:${PORT}/api/health`
                );

                console.log(
                    `TTS: http://localhost:${PORT}/api/tts`
                );

                console.log(
                    `Usage: http://localhost:${PORT}/api/usage`
                );

                console.log(
                    `AI: http://localhost:${PORT}/api/ai`
                );

                console.log(
                    `Translation: http://localhost:${PORT}/api/translate`
                );

                console.log(
                    `Profile: http://localhost:${PORT}/api/profile`
                );

                console.log(
                    `Admin: http://localhost:${PORT}/api/admin`
                );

                console.log(
                    "PostgreSQL: Connected"
                );

                console.log(
                    "Audio Storage: Supabase"
                );

                console.log(
                    `Daily Characters: ${
                        process.env.DAILY_CHARACTER_LIMIT ||
                        2000000
                    }`
                );

                console.log(
                    `Daily Requests: ${
                        process.env.DAILY_REQUEST_LIMIT ||
                        2000
                    }`
                );

                console.log(
                    "General API Rate Limit: 300 / 15 minutes"
                );

                console.log(
                    "Authentication Rate Limit: 30 / 15 minutes"
                );

                console.log(
                    "======================================"
                );
            }
        );
    } catch (error) {
        console.error(
            "Failed to start server:",
            error.message
        );

        process.exit(1);
    }
};

startServer();