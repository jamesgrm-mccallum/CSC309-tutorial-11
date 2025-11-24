import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes.js";

dotenv.config();

const app = express();

const normalizeOrigin = (origin) => {
    if (!origin) {
        return "";
    }

    try {
        const url = new URL(origin);
        return `${url.protocol}//${url.host}`;
    }
    catch (error) {
        return origin.replace(/\/+$/, "");
    }
};

const FRONTEND_URL = normalizeOrigin(process.env.FRONTEND_URL || "http://localhost:5173");
const FALLBACK_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
].map(normalizeOrigin);
const allowedOrigins = Array.from(
    new Set([FRONTEND_URL, ...FALLBACK_ORIGINS].filter(Boolean))
);
const corsOptions = {
    origin(origin, callback) {
        const normalized = normalizeOrigin(origin);

        if (!normalized || allowedOrigins.includes(normalized)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('', routes);

export default app;
