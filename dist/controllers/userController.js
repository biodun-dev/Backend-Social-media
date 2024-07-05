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
exports.followUser = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorUtils_1 = require("../utils/errorUtils"); // Import the isError function
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const user = new User_1.default({ username, email, password });
        yield user.save();
        res.status(201).send("User registered successfully");
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user || !(yield user.comparePassword(password))) {
            return res.status(401).send("Authentication failed");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({ token });
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.login = login;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const { followId } = req.params; // ID of the user to follow
        const user = yield User_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.following.includes(followId)) {
            user.following.push(followId);
            yield user.save();
            res.status(200).send("User followed");
        }
        else {
            res.status(400).send("Already following this user");
        }
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.followUser = followUser;
