"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const events_1 = require("./events");
const User_1 = __importDefault(require("../models/User"));
const SECRET_KEY = process.env.JWT_SECRET;
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {});
    io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("A user connected: " + socket.id);
        const userId = yield getUserIdFromSocket(socket);
        if (!userId) {
            console.log("Unauthorized connection attempt");
            socket.disconnect();
            return;
        }
        try {
            const user = (yield User_1.default.findByIdAndUpdate(userId, { socketId: socket.id }, { new: true, useFindAndModify: false }));
            if (user) {
                console.log(`Updated user ${user.username} with socket ID: ${socket.id}`);
            }
            else {
                console.log("User not found");
            }
        }
        catch (err) {
            console.log("Error updating user with socket ID:", err);
        }
        socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("User disconnected:", socket.id);
            try {
                const user = (yield User_1.default.findByIdAndUpdate(userId, { $unset: { socketId: "" } }, { new: true, useFindAndModify: false }));
                if (user) {
                    console.log(`Cleared socket ID for user ${user.username}`);
                }
                else {
                    console.log("User not found");
                }
            }
            catch (err) {
                console.log("Error clearing socket ID:", err);
            }
        }));
        socket.on("likePost", (data) => {
            socket.broadcast.emit("notification", (0, events_1.notificationEvent)("like", data));
        });
        socket.on("commentPost", (data) => {
            socket.broadcast.emit("notification", (0, events_1.notificationEvent)("comment", data));
        });
    }));
    return io;
};
exports.initSocket = initSocket;
const getUserIdFromSocket = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    const token = socket.handshake.query.token;
    if (!token) {
        console.log("No token provided");
        return null;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const user = (yield User_1.default.findById(decoded.id));
        if (!user) {
            console.log("Invalid token: User not found");
            return null;
        }
        return user._id.toString();
    }
    catch (err) {
        console.log("JWT verification error:", err);
        return null;
    }
});
