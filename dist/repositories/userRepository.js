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
exports.getUserLatestScore = exports.createUserScore = exports.checkUserExistStatus = exports.deleteForgotPasswordOtp = exports.getForgotPasswordOtp = exports.updateUserPassword = exports.updateUserEmail = exports.updateUserLastName = exports.updateUserFirstName = exports.getUserExerciseReportByTime = exports.getUserExerciseReportByDate = exports.updateEmailVerificationStatus = exports.deleteEmailVerificationToken = exports.getEmailVerificationToken = exports.saveForgotPasswordOtp = exports.saveEmailVerificationToken = exports.createUserFeedback = exports.updateUserLevel = exports.getInitialPainDetails = exports.getUserProfileDetails = exports.createUserInitialPainDetails = exports.getUserById = exports.getUserByEmail = exports.checkUserEmailExistStatus = exports.createUser = void 0;
const db_1 = __importDefault(require("../config/db"));
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)", [user.first_name, user.last_name, user.email, user.password]);
    return Object.assign({ id: result.insertId }, user);
});
exports.createUser = createUser;
const checkUserEmailExistStatus = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT * FROM users WHERE email = ?", [
        email,
    ]);
    return result.length > 0;
});
exports.checkUserEmailExistStatus = checkUserEmailExistStatus;
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT * FROM users WHERE email = ?", [
        email,
    ]);
    return result[0];
});
exports.getUserByEmail = getUserByEmail;
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT * FROM users WHERE id = ?", [
        userId,
    ]);
    return Object.assign({}, result[0]);
});
exports.getUserById = getUserById;
const createUserInitialPainDetails = (painDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("INSERT INTO users_initial_pain (user_id, type_of_injury, injury_occured, diagnosed_by_medical_professional, pain_level,stiffness,swelling, has_pain_during_daily_activities, had_surgery, surgery_date, is_get_physiotherapy_before,is_previous_physiotherapy_completed, physiothrtapy_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        painDetails.user_id,
        painDetails.type_of_injury,
        painDetails.injury_occured,
        painDetails.diagnosed_by_medical_professional,
        painDetails.pain_level,
        painDetails.stiffness,
        painDetails.swelling,
        painDetails.has_pain_during_daily_activities,
        painDetails.had_surgery,
        painDetails.surgery_date,
        painDetails.is_get_physiotherapy_before,
        painDetails.is_previous_physiotherapy_completed,
        painDetails.physiothrtapy_description,
    ]);
    return result.affectedRows > 0;
});
exports.createUserInitialPainDetails = createUserInitialPainDetails;
const getUserProfileDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT id,first_name,last_name,email,is_email_verified,level FROM users WHERE id = ?", [userId]);
    return Object.assign({}, result[0]);
});
exports.getUserProfileDetails = getUserProfileDetails;
const getInitialPainDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT * FROM users_initial_pain WHERE user_id = ?", [userId]);
    return result[0];
});
exports.getInitialPainDetails = getInitialPainDetails;
const updateUserLevel = (userId, level) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("UPDATE users SET level = ? WHERE id = ?", [level, userId]);
    return result.affectedRows > 0;
});
exports.updateUserLevel = updateUserLevel;
const createUserFeedback = (feedbackDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("INSERT INTO users_feedbacks (user_id,pain_level,swelling,stiffness,fatigue_level,strength_perception,functional_improvement,exercise_tolerance) VALUES (?,?,?,?,?,?,?,?)", [
        feedbackDetails.user_id,
        feedbackDetails.pain_level,
        feedbackDetails.swelling,
        feedbackDetails.stiffness,
        feedbackDetails.fatigue_level,
        feedbackDetails.strength_perception,
        feedbackDetails.functional_improvement,
        feedbackDetails.exercise_tolerance,
    ]);
    return result.affectedRows > 0;
});
exports.createUserFeedback = createUserFeedback;
const saveEmailVerificationToken = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.execute("INSERT INTO users_email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [userId, token, new Date(Date.now() + 24 * 60 * 60 * 1000)]);
});
exports.saveEmailVerificationToken = saveEmailVerificationToken;
const saveForgotPasswordOtp = (userId, otp) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.execute("INSERT INTO users_forgot_password_otps (user_id, otp, expires_at) VALUES (?, ?, ?)", [userId, otp, new Date(Date.now() + 15 * 60 * 1000)]);
});
exports.saveForgotPasswordOtp = saveForgotPasswordOtp;
const getEmailVerificationToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT * FROM users_email_verification_tokens WHERE token = ? AND expires_at > ?", [token, new Date()]);
    return result[0];
});
exports.getEmailVerificationToken = getEmailVerificationToken;
const deleteEmailVerificationToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.execute("DELETE FROM users_email_verification_tokens WHERE token = ?", [token]);
});
exports.deleteEmailVerificationToken = deleteEmailVerificationToken;
const updateEmailVerificationStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.execute("UPDATE users SET is_email_verified = ? WHERE id = ?", [
        true,
        userId,
    ]);
});
exports.updateEmailVerificationStatus = updateEmailVerificationStatus;
const getUserExerciseReportByDate = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, COUNT(*) AS count FROM users_feedbacks WHERE user_id=? AND date>=NOW() - INTERVAL 14 DAY GROUP BY DATE_FORMAT(date, '%Y-%m-%d') ORDER BY date ASC", [userId]);
    return result;
});
exports.getUserExerciseReportByDate = getUserExerciseReportByDate;
const getUserExerciseReportByTime = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute(`
    WITH feedback_periods AS (
      SELECT 
          CASE
              WHEN TIME(date) BETWEEN '00:00:00' AND '11:59:59' THEN 'morning'
              WHEN TIME(date) BETWEEN '12:00:00' AND '17:59:59' THEN 'afternoon'
              WHEN TIME(date) BETWEEN '18:00:00' AND '23:59:59' THEN 'evening'
          END AS period
      FROM 
          users_feedbacks
      WHERE 
          user_id=? AND 
          date >= NOW() - INTERVAL 14 DAY
    ),
    periods AS (
      SELECT 'morning' AS period
      UNION ALL
      SELECT 'afternoon'
      UNION ALL
      SELECT 'evening'
    )
    SELECT 
        p.period,
        ROUND(
            (COUNT(f.period) * 100.0 / (SELECT COUNT(*) FROM feedback_periods)), 2
        ) AS percentage
    FROM 
        periods p
    LEFT JOIN feedback_periods f
        ON p.period = f.period
    GROUP BY 
        p.period
    ORDER BY 
        FIELD(p.period, 'morning', 'afternoon', 'evening');
    `, [userId]);
    return result;
});
exports.getUserExerciseReportByTime = getUserExerciseReportByTime;
const updateUserFirstName = (userId, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("UPDATE users SET first_name = ? WHERE id = ?", [firstName, userId]);
    return result.affectedRows > 0;
});
exports.updateUserFirstName = updateUserFirstName;
const updateUserLastName = (userId, lastName) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("UPDATE users SET last_name = ? WHERE id = ?", [lastName, userId]);
    return result.affectedRows > 0;
});
exports.updateUserLastName = updateUserLastName;
const updateUserEmail = (userId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("UPDATE users SET email = ?, is_email_verified = ? WHERE id = ?", [email, false, userId]);
    return result.affectedRows > 0;
});
exports.updateUserEmail = updateUserEmail;
const updateUserPassword = (userId, password) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("UPDATE users SET password = ? WHERE id = ?", [password, userId]);
    return result.affectedRows > 0;
});
exports.updateUserPassword = updateUserPassword;
const getForgotPasswordOtp = (otp) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT * FROM users_forgot_password_otps WHERE otp = ? AND expires_at > ?", [otp, new Date()]);
    return result[0];
});
exports.getForgotPasswordOtp = getForgotPasswordOtp;
const deleteForgotPasswordOtp = (otp) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.execute("DELETE FROM users_forgot_password_otps WHERE otp = ?", [
        otp,
    ]);
});
exports.deleteForgotPasswordOtp = deleteForgotPasswordOtp;
const checkUserExistStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT * FROM users WHERE id = ?", [
        userId,
    ]);
    return result.length > 0;
});
exports.checkUserExistStatus = checkUserExistStatus;
const createUserScore = (userId, score) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("INSERT INTO users_scores (user_id,score) VALUES (?,?)", [userId, score]);
    return result.affectedRows > 0;
});
exports.createUserScore = createUserScore;
const getUserLatestScore = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute("SELECT * FROM users_scores WHERE user_id = ? ORDER BY id DESC LIMIT 1", [userId]);
    return result[0];
});
exports.getUserLatestScore = getUserLatestScore;
