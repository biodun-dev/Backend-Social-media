import { Request, Response, NextFunction, RequestHandler } from "express";

export const conditionalMiddleware = (
  middleware: RequestHandler
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === "test") {
      return next();
    }
    return middleware(req, res, next);
  };
};
