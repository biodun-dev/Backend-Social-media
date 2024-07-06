import { Response } from "express";

// Standardized response function
export function sendResponse(res: Response, statusCode: number, data: any) {
    res.status(statusCode).json(data);
}
