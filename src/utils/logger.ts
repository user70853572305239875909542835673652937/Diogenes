import winston from "winston";
import path from "path";

// Define log directory path
const logDirectory = path.join(__dirname, "../../logs");

// Create a Winston logger instance with file and console transports
const logger = winston.createLogger({
  level: "info", // Set the minimum log level
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}]: ${message}`,
    ),
  ),
  transports: [
    // Console transport for real-time logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Adds color to console logs
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} [${level}]: ${message}`,
        ),
      ),
    }),
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
    // File transport for combined logs
    new winston.transports.File({
      filename: path.join(logDirectory, "combined.log"),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDirectory, "exceptions.log"),
    }),
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

export default logger;
