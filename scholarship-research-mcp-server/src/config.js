import dotenv from "dotenv";
dotenv.config();

export const config = {
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/scholarship_research",
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? "127.0.0.1",
};