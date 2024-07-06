import { Request, Response, NextFunction } from "express";
import { isError } from "./errorUtils";
import logger from "./logger";

const handleError = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isError(error)) {
    logger.error(`Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  } else {
    logger.error("Unknown error occurred");
    res.status(500).json({ message: "An unknown error occurred" });
  }
};

export default handleError;
