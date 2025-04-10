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
exports.verifyToken = exports.resetPassword = exports.verifyResetPasswordOtp = exports.forgotPassword = exports.updateUserProfileDetails = exports.getUserExerciseReport = exports.requestEmailverificationLink = exports.verifyEmail = exports.createUserFeedback = exports.getUserProfile = exports.getStarted = exports.signInUser = exports.signUpUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const httpConstants_1 = require("../constants/httpConstants");
const userRepository_1 = require("../repositories/userRepository");
const userService_1 = require("../services/userService");
const emailSender_1 = require("../utils/emailSender");
const hashOtp_1 = require("../utils/hashOtp");
const response_1 = require("../utils/response");
const uniqueTokenGenerator_1 = require("../utils/uniqueTokenGenerator");
const userLevelCalculator_1 = require("../utils/userLevelCalculator");
const userToken_1 = require("../utils/userToken");
const userValidations_1 = require("../validations/userValidations");
const signUpUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        const { error } = userValidations_1.createUserSchema.validate(user);
        if (error) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: error.details[0].message,
            }));
        }
        const isUserExist = yield (0, userService_1.checkEmailExistStatus)(user.email);
        if (isUserExist) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.EMAIL_ALREADY_EXIST,
            }));
        }
        const hashedPassword = yield bcryptjs_1.default.hash(user.password, 10);
        const createdUser = yield (0, userService_1.createNewUser)(Object.assign(Object.assign({}, user), { password: hashedPassword }));
        const emailVerificationToken = (0, uniqueTokenGenerator_1.generateUniqueToken)(64);
        yield (0, userService_1.saveEmailVerificationTokens)(createdUser.id, emailVerificationToken);
        yield (0, emailSender_1.sendEmailVerificationLink)(createdUser.first_name, createdUser.email, emailVerificationToken);
        return res.status(httpConstants_1.HTTP_STATUS.CREATED).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.CREATED,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.USER_CREATED,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.signUpUser = signUpUser;
const signInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { error } = userValidations_1.signInUserSchema.validate(req.body);
        if (error) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: error.details[0].message,
            }));
        }
        const existUser = yield (0, userService_1.getUserByEmailAddress)(email);
        if (!existUser) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.EMAIL_NOT_EXIST,
            }));
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, existUser.password);
        if (!isPasswordValid) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_EMAIL_OR_PASSWORD,
            }));
        }
        if (!existUser.id) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        if (!existUser.is_email_verified) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.EMAIL_NOT_VERIFIED,
            }));
        }
        const initialPainDetails = yield (0, userService_1.getInitialPainDetails)(existUser.id);
        const accessToken = (0, userToken_1.generateAccessToken)(existUser.id, existUser.email);
        return res.status(httpConstants_1.HTTP_STATUS.OK).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.OK,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.USER_SIGN_IN,
            data: {
                is_first_time_login: !initialPainDetails,
                access_token: accessToken,
            },
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.signInUser = signInUser;
const getStarted = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { type_of_injury, injury_occured, diagnosed_by_medical_professional, pain_level, stiffness, swelling, has_pain_during_daily_activities, had_surgery, surgery_date, is_get_physiotherapy_before, physiothrtapy_description, is_previous_physiotherapy_completed, } = req.body;
        const { error } = userValidations_1.userInitialPainSchema.validate(req.body);
        if (error) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: error.details[0].message,
            }));
        }
        if (!userId) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        const initialPainDetails = yield (0, userService_1.getInitialPainDetails)(userId);
        if (initialPainDetails) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INITIAL_PAIN_ALREADY_ADDED,
            }));
        }
        yield (0, userService_1.createInitialPainDetails)({
            user_id: userId,
            type_of_injury,
            injury_occured,
            diagnosed_by_medical_professional,
            pain_level,
            stiffness,
            swelling,
            is_previous_physiotherapy_completed,
            has_pain_during_daily_activities,
            had_surgery,
            surgery_date,
            is_get_physiotherapy_before,
            physiothrtapy_description,
        });
        const userInitialLevel = (0, userLevelCalculator_1.calculateUserInitialLevel)({
            user_id: userId,
            type_of_injury,
            injury_occured,
            diagnosed_by_medical_professional,
            pain_level,
            stiffness,
            swelling,
            is_previous_physiotherapy_completed,
            has_pain_during_daily_activities,
            had_surgery,
            surgery_date,
            is_get_physiotherapy_before,
            physiothrtapy_description,
        });
        yield (0, userRepository_1.updateUserLevel)(userId, userInitialLevel.level);
        yield (0, userService_1.createUserScoreService)(userId, userInitialLevel.score);
        return res.status(httpConstants_1.HTTP_STATUS.CREATED).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.CREATED,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.USER_INITIAL_PAIN_ADDED,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.getStarted = getStarted;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        const isUserExist = yield (0, userService_1.checkUserExistStatusService)(userId);
        if (!isUserExist) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        const userProfile = yield (0, userService_1.getUserProfileDetails)(userId);
        const initialPainDetails = yield (0, userService_1.getInitialPainDetails)(userId);
        return res.status(httpConstants_1.HTTP_STATUS.OK).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.OK,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.USER_DETAILS_FETCHED,
            data: {
                user_profile_details: userProfile,
                initial_pain_details: initialPainDetails,
            },
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.getUserProfile = getUserProfile;
const createUserFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { pain_level, swelling, stiffness, fatigue_level, strength_perception, functional_improvement, exercise_tolerance, } = req.body;
        const { error } = userValidations_1.userFeedbackSchema.validate(req.body);
        if (error) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: error.details[0].message,
            }));
        }
        if (!userId) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        const profileDetails = yield (0, userService_1.getUserProfileDetails)(userId);
        // const score = calculateUserPainLevel({
        //   pain_level,
        //   swelling,
        //   stiffness,
        //   fatigue_level,
        // });
        const userScoreDetails = yield (0, userService_1.getUserLatestScoreService)(userId);
        const userUpdatedLevelAndScoreDetails = (0, userLevelCalculator_1.calculateUserUpdatedLevel)(profileDetails.level, userScoreDetails.score, req.body);
        if (userUpdatedLevelAndScoreDetails.level > 10) {
            yield (0, userRepository_1.updateUserLevel)(userId, 10);
        }
        else if (userUpdatedLevelAndScoreDetails.level < 1) {
            yield (0, userRepository_1.updateUserLevel)(userId, 1);
        }
        else {
            yield (0, userRepository_1.updateUserLevel)(userId, userUpdatedLevelAndScoreDetails.level);
        }
        yield (0, userService_1.createUserScoreService)(userId, userUpdatedLevelAndScoreDetails.score);
        yield (0, userService_1.createfeedback)({
            user_id: userId,
            pain_level,
            swelling,
            stiffness,
            fatigue_level,
            strength_perception,
            functional_improvement,
            exercise_tolerance,
        });
        return res.status(httpConstants_1.HTTP_STATUS.CREATED).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.CREATED,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.USER_FEEDBACK_ADDED,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.createUserFeedback = createUserFeedback;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            return res
                .status(httpConstants_1.HTTP_STATUS.BAD_REQUEST)
                .send(httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_OR_EXPIRED_LINK);
        }
        const existToken = yield (0, userService_1.getEmailVerificationTokenService)(token);
        if (!existToken) {
            return res
                .status(httpConstants_1.HTTP_STATUS.BAD_REQUEST)
                .send(httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_OR_EXPIRED_LINK);
        }
        yield (0, userService_1.updateEmailVerificationStatusService)(existToken.user_id);
        yield (0, userService_1.deleteEmailVerificationTokenService)(token);
        return res
            .status(httpConstants_1.HTTP_STATUS.OK)
            .send(httpConstants_1.HTTP_RESPONSE_MESSAGES.EMAIL_VERIFIED);
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.verifyEmail = verifyEmail;
const requestEmailverificationLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        const existUserDetails = yield (0, userService_1.getUserProfileDetails)(userId);
        if (!existUserDetails) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        if (existUserDetails.is_email_verified) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED,
            }));
        }
        const emailVerificationToken = (0, uniqueTokenGenerator_1.generateUniqueToken)(64);
        yield (0, userService_1.saveEmailVerificationTokens)(userId, emailVerificationToken);
        yield (0, emailSender_1.sendEmailVerificationLink)(existUserDetails.first_name, existUserDetails.email, emailVerificationToken);
        return res.status(httpConstants_1.HTTP_STATUS.OK).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.OK,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.EMAIL_VERIFICATION_LINK_SENT,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.requestEmailverificationLink = requestEmailverificationLink;
const getUserExerciseReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        const isUserExist = yield (0, userService_1.checkUserExistStatusService)(userId);
        if (!isUserExist) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        const reportData = yield (0, userService_1.getUserExerciseReportByDateService)(userId);
        const reportDataByTime = yield (0, userService_1.getUserExerciseReportByTimeService)(userId);
        return res.status(httpConstants_1.HTTP_STATUS.OK).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.OK,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.USER_EXERCISES_DETAILS_FETCHED,
            data: {
                report_data: reportData,
                report_data_by_time: reportDataByTime,
            },
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.getUserExerciseReport = getUserExerciseReport;
const updateUserProfileDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { first_name, last_name, email, old_password, new_password } = req.body;
        if (!userId) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        const { error } = userValidations_1.updateUserDetailsSchema.validate(req.body);
        if (error) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: error.details[0].message,
            }));
        }
        const existUserDetails = yield (0, userService_1.getUserAllDetails)(userId);
        if (!existUserDetails) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        if (email) {
            if (email !== existUserDetails.email) {
                const isUserExist = yield (0, userService_1.checkEmailExistStatus)(email);
                if (isUserExist) {
                    return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                        status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                        message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                        error: httpConstants_1.HTTP_RESPONSE_MESSAGES.EMAIL_ALREADY_EXIST,
                    }));
                }
            }
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(old_password, existUserDetails.password);
        if (!isPasswordValid) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_CREDENTIALS,
            }));
        }
        //! Update first name
        if (first_name) {
            yield (0, userService_1.updateUserFirstNameService)(userId, first_name);
        }
        //! Update last name
        if (last_name) {
            yield (0, userService_1.updateUserLastNameService)(userId, last_name);
        }
        //! Update email
        if (email) {
            yield (0, userService_1.updateUserEmailService)(userId, email);
        }
        //! Update password
        if (new_password) {
            const hashedPassword = yield bcryptjs_1.default.hash(new_password, 10);
            yield (0, userService_1.updateUserPasswordService)(userId, hashedPassword);
        }
        return res.status(httpConstants_1.HTTP_STATUS.OK).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.OK,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.USER_DETAILS_UPDATED,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.updateUserProfileDetails = updateUserProfileDetails;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const { error } = userValidations_1.forgotPasswordSchema.validate(req.body);
        if (error) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: error.details[0].message,
            }));
        }
        const existUserDetails = yield (0, userService_1.getUserByEmailAddress)(email);
        if (!existUserDetails) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.EMAIL_NOT_EXIST,
            }));
        }
        const otp = otp_generator_1.default.generate(4, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP: ", otp);
        const hashedOtp = (0, hashOtp_1.hashOTP)(otp);
        yield (0, userService_1.saveForgotPasswordOtpService)(existUserDetails.id, hashedOtp);
        yield (0, emailSender_1.sendForgotPasswordOtp)(email, otp);
        return res.status(httpConstants_1.HTTP_STATUS.OK).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.OK,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.FORGOT_PASSWORD_OTP_SENT,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.forgotPassword = forgotPassword;
const verifyResetPasswordOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        const { error } = userValidations_1.verifyResetPasswordOtpSchema.validate(req.body);
        if (error) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: error.details[0].message,
            }));
        }
        const hashedOtp = (0, hashOtp_1.hashOTP)(otp);
        const isExistOtp = yield (0, userService_1.getForgotPasswordOtpService)(hashedOtp);
        if (!isExistOtp) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_OTP,
            }));
        }
        return res.status(httpConstants_1.HTTP_STATUS.OK).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.OK,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.VALID_OTP,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.verifyResetPasswordOtp = verifyResetPasswordOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { new_password, otp } = req.body;
        const { error } = userValidations_1.resetPasswordSchema.validate(req.body);
        if (error) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: error.details[0].message,
            }));
        }
        const hashedOtp = (0, hashOtp_1.hashOTP)(otp);
        const isExistOtp = yield (0, userService_1.getForgotPasswordOtpService)(hashedOtp);
        if (!isExistOtp) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_OTP,
            }));
        }
        const hashedPassword = yield bcryptjs_1.default.hash(new_password, 10);
        yield (0, userService_1.updateUserPasswordService)(isExistOtp.user_id, hashedPassword);
        yield (0, userService_1.deleteForgotPasswordOtpService)(hashedOtp);
        return res.status(httpConstants_1.HTTP_STATUS.OK).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.OK,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.PASSWORD_RESET_SUCCESS,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.resetPassword = resetPassword;
const verifyToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(httpConstants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.errorResponse)({
                status: httpConstants_1.HTTP_STATUS.BAD_REQUEST,
                message: httpConstants_1.HTTP_MESSAGES.BAD_REQUEST,
                error: httpConstants_1.HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
            }));
        }
        return res.status(httpConstants_1.HTTP_STATUS.OK).json((0, response_1.successResponse)({
            status: httpConstants_1.HTTP_STATUS.OK,
            message: httpConstants_1.HTTP_RESPONSE_MESSAGES.TOKEN_VERIFIED,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            status: httpConstants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: httpConstants_1.HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
        }));
    }
});
exports.verifyToken = verifyToken;
