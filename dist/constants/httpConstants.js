"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_RESPONSE_MESSAGES = exports.HTTP_MESSAGES = exports.HTTP_STATUS = void 0;
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};
exports.HTTP_MESSAGES = {
    SUCCESS: "Success",
    CREATED: "Resource created successfully",
    BAD_REQUEST: "Bad request",
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
    NOT_FOUND: "Resource not found",
    INTERNAL_SERVER_ERROR: "Internal server error",
};
exports.HTTP_RESPONSE_MESSAGES = {
    ACCESS_TOKEN_REQUIRED: "Access token required",
    INVALID_OR_EXPIRED_ACCESS_TOKEN: "Invalid or expired access token",
    USER_CREATED: "User created successfully",
    EMAIL_ALREADY_EXIST: "Email already exist",
    USER_SIGN_IN: "User signed in successfully",
    EMAIL_NOT_EXIST: "Email does not exist",
    INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
    INVALID_USER_DETAILS: "Invalid user details",
    USER_INITIAL_PAIN_ADDED: "Initial pain added successfully",
    USER_DETAILS_FETCHED: "User details fetched successfully",
    USER_FEEDBACK_ADDED: "User feedback added successfully",
    INVALID_OR_EXPIRED_LINK: "Invalid or expired link",
    EMAIL_VERIFIED: "Email verified successfully",
    EMAIL_ALREADY_VERIFIED: "Email already verified",
    EMAIL_VERIFICATION_LINK_SENT: "Email verification link sent successfully",
    USER_EXERCISES_DETAILS_FETCHED: "User exercises details fetched successfully",
    USER_DETAILS_UPDATED: "User details updated successfully",
    INVALID_USER_CREDENTIALS: "Invalid user credentials",
    FORGOT_PASSWORD_OTP_SENT: "Forgot password OTP sent successfully",
    EMAIL_NOT_VERIFIED: "Email not verified. Please verify your email",
    INITIAL_PAIN_ALREADY_ADDED: "Initial pain details already added",
    PASSWORD_RESET_SUCCESS: "Password reset successfully",
    INVALID_OTP: "Invalid OTP",
    VALID_OTP: "Valid OTP",
    TOKEN_VERIFIED: "Token verified successfully",
};
