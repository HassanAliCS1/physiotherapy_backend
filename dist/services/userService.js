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
exports.getUserLatestScoreService = exports.createUserScoreService = exports.checkUserExistStatusService = exports.deleteForgotPasswordOtpService = exports.getForgotPasswordOtpService = exports.saveForgotPasswordOtpService = exports.updateUserPasswordService = exports.updateUserEmailService = exports.updateUserLastNameService = exports.updateUserFirstNameService = exports.getUserExerciseReportByTimeService = exports.getUserExerciseReportByDateService = exports.updateEmailVerificationStatusService = exports.deleteEmailVerificationTokenService = exports.getEmailVerificationTokenService = exports.saveEmailVerificationTokens = exports.createfeedback = exports.updateUserLevel = exports.getInitialPainDetails = exports.getUserAllDetails = exports.getUserProfileDetails = exports.createInitialPainDetails = exports.getUserByEmailAddress = exports.checkEmailExistStatus = exports.createNewUser = void 0;
const userRepository_1 = require("../repositories/userRepository");
const createNewUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.createUser)(user);
});
exports.createNewUser = createNewUser;
const checkEmailExistStatus = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.checkUserEmailExistStatus)(email);
});
exports.checkEmailExistStatus = checkEmailExistStatus;
const getUserByEmailAddress = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getUserByEmail)(email);
});
exports.getUserByEmailAddress = getUserByEmailAddress;
const createInitialPainDetails = (painDetails) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.createUserInitialPainDetails)(painDetails);
});
exports.createInitialPainDetails = createInitialPainDetails;
const getUserProfileDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getUserProfileDetails)(userId);
});
exports.getUserProfileDetails = getUserProfileDetails;
const getUserAllDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getUserById)(userId);
});
exports.getUserAllDetails = getUserAllDetails;
const getInitialPainDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getInitialPainDetails)(userId);
});
exports.getInitialPainDetails = getInitialPainDetails;
const updateUserLevel = (userId, level) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.updateUserLevel)(userId, level);
});
exports.updateUserLevel = updateUserLevel;
const createfeedback = (feedback) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.createUserFeedback)(feedback);
});
exports.createfeedback = createfeedback;
const saveEmailVerificationTokens = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.saveEmailVerificationToken)(userId, token);
});
exports.saveEmailVerificationTokens = saveEmailVerificationTokens;
const getEmailVerificationTokenService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getEmailVerificationToken)(token);
});
exports.getEmailVerificationTokenService = getEmailVerificationTokenService;
const deleteEmailVerificationTokenService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.deleteEmailVerificationToken)(token);
});
exports.deleteEmailVerificationTokenService = deleteEmailVerificationTokenService;
const updateEmailVerificationStatusService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.updateEmailVerificationStatus)(userId);
});
exports.updateEmailVerificationStatusService = updateEmailVerificationStatusService;
const getUserExerciseReportByDateService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getUserExerciseReportByDate)(userId);
});
exports.getUserExerciseReportByDateService = getUserExerciseReportByDateService;
const getUserExerciseReportByTimeService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getUserExerciseReportByTime)(userId);
});
exports.getUserExerciseReportByTimeService = getUserExerciseReportByTimeService;
const updateUserFirstNameService = (userId, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.updateUserFirstName)(userId, firstName);
});
exports.updateUserFirstNameService = updateUserFirstNameService;
const updateUserLastNameService = (userId, lastName) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.updateUserLastName)(userId, lastName);
});
exports.updateUserLastNameService = updateUserLastNameService;
const updateUserEmailService = (userId, email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.updateUserEmail)(userId, email);
});
exports.updateUserEmailService = updateUserEmailService;
const updateUserPasswordService = (userId, password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.updateUserPassword)(userId, password);
});
exports.updateUserPasswordService = updateUserPasswordService;
const saveForgotPasswordOtpService = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.saveForgotPasswordOtp)(userId, token);
});
exports.saveForgotPasswordOtpService = saveForgotPasswordOtpService;
const getForgotPasswordOtpService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getForgotPasswordOtp)(token);
});
exports.getForgotPasswordOtpService = getForgotPasswordOtpService;
const deleteForgotPasswordOtpService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.deleteForgotPasswordOtp)(token);
});
exports.deleteForgotPasswordOtpService = deleteForgotPasswordOtpService;
const checkUserExistStatusService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.checkUserExistStatus)(userId);
});
exports.checkUserExistStatusService = checkUserExistStatusService;
const createUserScoreService = (userId, score) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.createUserScore)(userId, score);
});
exports.createUserScoreService = createUserScoreService;
const getUserLatestScoreService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getUserLatestScore)(userId);
});
exports.getUserLatestScoreService = getUserLatestScoreService;
