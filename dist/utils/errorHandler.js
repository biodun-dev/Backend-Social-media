"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorUtils_1 = require("./errorUtils");
const logger_1 = __importDefault(require("./logger"));
const handleError = (error, req, res, next) => {
    if ((0, errorUtils_1.isError)(error)) {
        logger_1.default.error(`Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
    else {
        logger_1.default.error("Unknown error occurred");
        res.status(500).json({ message: "An unknown error occurred" });
    }
};
exports.default = handleError;
