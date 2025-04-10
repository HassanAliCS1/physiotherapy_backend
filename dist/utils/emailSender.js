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
exports.sendForgotPasswordOtp = exports.sendEmailVerificationLink = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_SERVER_EMAIL,
        pass: process.env.MAIL_SERVER_PASSWORD,
    },
});
const sendEmailVerificationLink = (first_name, email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const port = process.env.PORT || 3000;
    const baseUrl = process.env.NODE_ENV === "production"
        ? process.env.PRODUCTION_BASE_URL
        : `http://localhost:${port}`;
    const mailOptions = {
        from: process.env.MAIL_SERVER_EMAIL,
        to: email,
        subject: "Email Verification",
        text: `Hi ${first_name},\n\n Click on the link to verify your email ${baseUrl}/api/auth/verify-email/${token}`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        }
    });
});
exports.sendEmailVerificationLink = sendEmailVerificationLink;
const sendForgotPasswordOtp = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.MAIL_SERVER_EMAIL,
        to: email,
        subject: "Reset Password",
        text: `Your OTP to reset password is ${otp}`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        }
    });
});
exports.sendForgotPasswordOtp = sendForgotPasswordOtp;
