import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error if no status code is set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Customize the response based on error type
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ message: "Invalid Token" });
  } else if (err.message.includes("A token is required")) {
    res.status(403).json({ message: "A token is required for authentication" });
  } else {
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : "🥞",
    });
  }
};

export default errorHandler;
