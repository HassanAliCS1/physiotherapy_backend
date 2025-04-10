"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({
        user_id: userId,
        email: email,
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
};
exports.generateAccessToken = generateAccessToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
