"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = sendResponse;
// Standardized response function
function sendResponse(res, statusCode, data) {
    res.status(statusCode).json(data);
}
