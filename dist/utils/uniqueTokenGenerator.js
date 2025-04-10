"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueToken = void 0;
const crypto_1 = require("crypto");
const generateUniqueToken = (length = 32) => {
    return (0, crypto_1.randomBytes)(length).toString("hex");
};
exports.generateUniqueToken = generateUniqueToken;
