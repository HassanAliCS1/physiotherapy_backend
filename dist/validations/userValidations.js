"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetPasswordOtpSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.updateUserDetailsSchema = exports.userFeedbackSchema = exports.userInitialPainSchema = exports.signInUserSchema = exports.createUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createUserSchema = joi_1.default.object({
    first_name: joi_1.default.string().required(),
    last_name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required().min(8),
});
exports.signInUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.userInitialPainSchema = joi_1.default.object({
    type_of_injury: joi_1.default.string().valid("shoulder", "knee").required(),
    injury_occured: joi_1.default.string()
        .valid("LESS_THAN_2_WEEKS", "TWO_WEEKS_TO_1_MONTH", "ONE_TO_3_MONTHS", "THREE_TO_6_MONTHS", "SIX_PLUS_MONTHS")
        .required(),
    diagnosed_by_medical_professional: joi_1.default.boolean().required(),
    pain_level: joi_1.default.number().min(1).max(10).required(),
    stiffness: joi_1.default.number().min(1).max(10).required(),
    swelling: joi_1.default.number().min(1).max(10).required(),
    has_pain_during_daily_activities: joi_1.default.boolean().required(),
    had_surgery: joi_1.default.boolean().required(),
    surgery_date: joi_1.default.date()
        .when("had_surgery", {
        is: true,
        then: joi_1.default.required(),
    })
        .allow(null),
    is_get_physiotherapy_before: joi_1.default.boolean().required(),
    is_previous_physiotherapy_completed: joi_1.default.boolean().when("is_get_physiotherapy_before", {
        is: true,
        then: joi_1.default.required(),
    }),
    physiothrtapy_description: joi_1.default.string()
        .when("is_get_physiotherapy_before", {
        is: true,
        then: joi_1.default.required(),
    })
        .allow(null),
});
exports.userFeedbackSchema = joi_1.default.object({
    pain_level: joi_1.default.number().min(1).max(10).required(),
    swelling: joi_1.default.number().min(1).max(10).required(),
    stiffness: joi_1.default.number().min(1).max(10).required(),
    fatigue_level: joi_1.default.number().min(1).max(10).required(),
    strength_perception: joi_1.default.number().min(1).max(10).required(),
    functional_improvement: joi_1.default.number().min(1).max(10).required(),
    exercise_tolerance: joi_1.default.number().min(1).max(10).required(),
});
exports.updateUserDetailsSchema = joi_1.default.object({
    first_name: joi_1.default.string(),
    last_name: joi_1.default.string(),
    email: joi_1.default.string().email(),
    old_password: joi_1.default.string().required(),
    new_password: joi_1.default.string().min(8),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
});
exports.resetPasswordSchema = joi_1.default.object({
    new_password: joi_1.default.string().required(),
    otp: joi_1.default.string().length(4).required(),
});
exports.verifyResetPasswordOtpSchema = joi_1.default.object({
    otp: joi_1.default.string().length(4).required(),
});
