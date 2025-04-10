"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const httpConstants_1 = require("../constants/httpConstants");
const successResponse = ({ status = httpConstants_1.HTTP_STATUS.OK, message = httpConstants_1.HTTP_MESSAGES.SUCCESS, data, pagination, }) => ({
    status,
    message,
    data,
    pagination,
});
exports.successResponse = successResponse;
const errorResponse = ({ status, message, error, }) => ({
    status,
    message,
    error: error || null,
});
exports.errorResponse = errorResponse;
