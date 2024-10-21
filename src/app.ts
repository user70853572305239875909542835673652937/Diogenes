import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
import os from "os";
import rateLimit from "express-rate-limit";
import cors from "cors";
import {
  infoRouter,
  episodesRouter,
  serversRouter,
  sourcesRouter,
  mappingsRouter,
} from ".";

// Load environment variables from .env file
dotenv.config();

// Validate essential environment variables
const {
  PORT = "8080",
  ALLOWED_ORIGINS = "",
  RATE_LIMIT_WINDOW_MS = "900000", // Default: 15 minutes in ms
  RATE_LIMIT_MAX = "100", // Default: 100 requests per window
} = process.env;

// Parse ALLOWED_ORIGINS into an array, trimming whitespace
const allowedOrigins = ALLOWED_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin !== "");

// Initialize Express App
const app = express();

// CORS Configuration
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
  },
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Apply CORS Middleware
app.use(cors(corsOptions));

// Rate Limiting Configuration
const windowMsNumber = parseInt(RATE_LIMIT_WINDOW_MS, 10);
const maxRequests = parseInt(RATE_LIMIT_MAX, 10);

const limiter = rateLimit({
  windowMs: isNaN(windowMsNumber) ? 15 * 60 * 1000 : windowMsNumber, // Fallback to 15 minutes
  max: isNaN(maxRequests) ? 100 : maxRequests, // Fallback to 100 requests
  message: "Too many requests.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply Rate Limiting Middleware to All Requests
app.use(limiter);

// Mount Routers
app.use("/info", infoRouter);
app.use("/episodes", episodesRouter);
app.use("/servers", serversRouter);
app.use("/sources", sourcesRouter);
app.use("/mappings", mappingsRouter);

// Error Handling Middleware for CORS
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof Error && err.message.startsWith("The CORS policy")) {
      logger.error(`CORS Error: ${err.message}`);
      return res.status(403).json({ error: err.message });
    }
    next(err);
  },
);

// Global Error Handling Middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error(`Unhandled Error: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  },
);

// Start the Server
app.listen(parseInt(PORT, 10), () => {
  const interfacesInfo = os.networkInterfaces();
  let lanIP = "";

  for (const name of Object.keys(interfacesInfo)) {
    const networkInterface = interfacesInfo[name];
    if (networkInterface) {
      for (const net of networkInterface) {
        if (net.family === "IPv4" && !net.internal) {
          lanIP = net.address;
          break;
        }
      }
    }
    if (lanIP) break;
  }

  logger.info(`Server running on port ${PORT}`);
  logger.info(`Local: http://localhost:${PORT}`);
  if (lanIP) {
    logger.info(`LAN: http://${lanIP}:${PORT}`);
  }
});
