"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureHelmet = void 0;
const helmet_1 = __importDefault(require("helmet"));
const configureHelmet = (app) => {
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'", "https:", "data:"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
        referrerPolicy: { policy: "no-referrer" },
        crossOriginResourcePolicy: { policy: "same-origin" },
        // Add other helmet configurations as needed
    }));
};
exports.configureHelmet = configureHelmet;
