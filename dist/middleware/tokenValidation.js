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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const httpConstants_1 = require("../constants/httpConstants");
const response_1 = require("../utils/response");
const userToken_1 = require("../utils/userToken");
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(httpConstants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.UNAUTHORIZED,
            message: httpConstants_1.HTTP_MESSAGES.UNAUTHORIZED,
            error: httpConstants_1.HTTP_RESPONSE_MESSAGES.ACCESS_TOKEN_REQUIRED,
        }));
    }
    try {
        const payload = (0, userToken_1.verifyAccessToken)(token);
        req.userId = payload.user_id;
        next();
    }
    catch (error) {
        return res.status(httpConstants_1.HTTP_STATUS.FORBIDDEN).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.FORBIDDEN,
            message: httpConstants_1.HTTP_MESSAGES.FORBIDDEN,
            error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_OR_EXPIRED_ACCESS_TOKEN,
        }));
    }
});
exports.authenticateToken = authenticateToken;
