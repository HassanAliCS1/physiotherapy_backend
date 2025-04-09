import cookieParser from "cookie-parser";
import express from "express";

import promisePool from "./config/db";
import userRouter from "./routes/userRoutes";

import cors from 'cors';

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3001';
console.log("FE Origin" + allowedOrigin);

const app = express();
promisePool.getConnection().then((connection) => {
  if (connection) {
    console.log("Database connected successfully!");
    connection.release();
  } else {
    console.log("Database connection failed");
  }
});

app.use(cors({
  origin: allowedOrigin,
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());
app.use("/api", userRouter);

export default app;
