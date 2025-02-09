import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/db.js";

import { authRoutes } from "./routes/auth-route.js";
import { organizationRoutes } from "./routes/organization-routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/organizations", organizationRoutes);
// app.use("/users", userRoutes);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

const PORT = process.env.PORT || 3899;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
