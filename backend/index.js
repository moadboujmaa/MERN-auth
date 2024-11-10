import express from 'express';
import { connectDB } from './db/connectDB.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
	console.log("Listened in port 5000")
	connectDB();
});
