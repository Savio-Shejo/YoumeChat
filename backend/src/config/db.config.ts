import dns from "node:dns";

// Use IPv4 first for DNS resolution consistency
dns.setDefaultResultOrder("ipv4first");


import mongoose from "mongoose";
import { env } from "./env.config";
import { logger } from "../utils/logger";

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error("Database connection error:", error);
    process.exit(1);
  }
};