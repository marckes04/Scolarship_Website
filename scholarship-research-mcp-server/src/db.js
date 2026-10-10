import dns from "node:dns";
import mongoose from "mongoose";
import { config } from "./config.js";

// Forzar resolución DNS pública para evitar el error ECONNREFUSED
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongodbUri);
  console.log("Connected to MongoDB successfully.");
  return mongoose.connection;
}