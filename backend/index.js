import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes.js";

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const corsOptions = {
    origin: FRONTEND_URL
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('', routes);

export default app;
