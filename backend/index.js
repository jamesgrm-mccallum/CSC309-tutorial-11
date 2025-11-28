import express from "express";
import routes from "./routes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5173";

app.use(cors({
    origin: FRONTEND_URL,
}))
app.use(express.json());
app.use('', routes);

export default app;