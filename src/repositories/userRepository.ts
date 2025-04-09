import pool from "../config/db";
import { UserFeedback } from "../models/userFeedbackModel";
import { CreateUserInitialPainDetails } from "../models/userInitialPainModel";
import { User } from "../models/userModel";
import { UserProfile } from "../models/userProfileModel";
import { UserScore } from "../models/userScoreModel";

export const createUser = async (user: User) => {
  const [result] = await pool.execute(
    "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
    [user.first_name, user.last_name, user.email, user.password]
  );
  return { id: (result as any).insertId, ...user };
};

export const checkUserEmailExistStatus = async (
  email: string
): Promise<boolean> => {
  const [result] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return (result as any).length > 0;
};

export const getUserByEmail = async (email: string): Promise<User> => {
  const [result] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return (result as any)[0];
};

export const getUserById = async (userId: number): Promise<User> => {
  const [result] = await pool.execute("SELECT * FROM users WHERE id = ?", [
    userId,
  ]);
  return { ...((result as any)[0] as User) };
};

export const createUserInitialPainDetails = async (
  painDetails: CreateUserInitialPainDetails
): Promise<boolean> => {
  const [result] = await pool.execute(
    "INSERT INTO users_initial_pain (user_id, type_of_injury, injury_occured, diagnosed_by_medical_professional, pain_level,stiffness,swelling, has_pain_during_daily_activities, had_surgery, surgery_date, is_get_physiotherapy_before,is_previous_physiotherapy_completed, physiothrtapy_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
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
    ]
  );
  return (result as any).affectedRows > 0;
};

export const getUserProfileDetails = async (
  userId: number
): Promise<UserProfile> => {
  const [result] = await pool.execute(
    "SELECT id,first_name,last_name,email,is_email_verified,level FROM users WHERE id = ?",
    [userId]
  );
  return { ...((result as any)[0] as UserProfile) };
};

export const getInitialPainDetails = async (userId: number) => {
  const [result] = await pool.execute(
    "SELECT * FROM users_initial_pain WHERE user_id = ?",
    [userId]
  );
  return (result as any)[0];
};

export const updateUserLevel = async (
  userId: number,
  level: number
): Promise<boolean> => {
  const [result] = await pool.execute(
    "UPDATE users SET level = ? WHERE id = ?",
    [level, userId]
  );
  return (result as any).affectedRows > 0;
};

export const createUserFeedback = async (feedbackDetails: UserFeedback) => {
  const [result] = await pool.execute(
    "INSERT INTO users_feedbacks (user_id,pain_level,swelling,stiffness,fatigue_level,strength_perception,functional_improvement,exercise_tolerance) VALUES (?,?,?,?,?,?,?,?)",
    [
      feedbackDetails.user_id,
      feedbackDetails.pain_level,
      feedbackDetails.swelling,
      feedbackDetails.stiffness,
      feedbackDetails.fatigue_level,
      feedbackDetails.strength_perception,
      feedbackDetails.functional_improvement,
      feedbackDetails.exercise_tolerance,
    ]
  );
  return (result as any).affectedRows > 0;
};

export const saveEmailVerificationToken = async (
  userId: number,
  token: string
): Promise<void> => {
  await pool.execute(
    "INSERT INTO users_email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, new Date(Date.now() + 24 * 60 * 60 * 1000)]
  );
};

export const saveForgotPasswordOtp = async (
  userId: number,
  otp: string
): Promise<void> => {
  await pool.execute(
    "INSERT INTO users_forgot_password_otps (user_id, otp, expires_at) VALUES (?, ?, ?)",
    [userId, otp, new Date(Date.now() + 15 * 60 * 1000)]
  );
};

export const getEmailVerificationToken = async (
  token: string
): Promise<any> => {
  const [result] = await pool.execute(
    "SELECT * FROM users_email_verification_tokens WHERE token = ? AND expires_at > ?",
    [token, new Date()]
  );
  return (result as any)[0];
};

export const deleteEmailVerificationToken = async (
  token: string
): Promise<void> => {
  await pool.execute(
    "DELETE FROM users_email_verification_tokens WHERE token = ?",
    [token]
  );
};

export const updateEmailVerificationStatus = async (
  userId: number
): Promise<void> => {
  await pool.execute("UPDATE users SET is_email_verified = ? WHERE id = ?", [
    true,
    userId,
  ]);
};

export const getUserExerciseReportByDate = async (userId: number) => {
  const [result] = await pool.execute(
    "SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, COUNT(*) AS count FROM users_feedbacks WHERE user_id=? AND date>=NOW() - INTERVAL 14 DAY GROUP BY DATE_FORMAT(date, '%Y-%m-%d') ORDER BY date ASC",
    [userId]
  );
  return result as any;
};

export const getUserExerciseReportByTime = async (userId: number) => {
  const [result] = await pool.execute(
    `
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
    `,
    [userId]
  );

  return result as any;
};

export const updateUserFirstName = async (
  userId: number,
  firstName: string
): Promise<boolean> => {
  const [result] = await pool.execute(
    "UPDATE users SET first_name = ? WHERE id = ?",
    [firstName, userId]
  );
  return (result as any).affectedRows > 0;
};

export const updateUserLastName = async (
  userId: number,
  lastName: string
): Promise<boolean> => {
  const [result] = await pool.execute(
    "UPDATE users SET last_name = ? WHERE id = ?",
    [lastName, userId]
  );
  return (result as any).affectedRows > 0;
};

export const updateUserEmail = async (
  userId: number,
  email: string
): Promise<boolean> => {
  const [result] = await pool.execute(
    "UPDATE users SET email = ?, is_email_verified = ? WHERE id = ?",
    [email, false, userId]
  );
  return (result as any).affectedRows > 0;
};

export const updateUserPassword = async (
  userId: number,
  password: string
): Promise<boolean> => {
  const [result] = await pool.execute(
    "UPDATE users SET password = ? WHERE id = ?",
    [password, userId]
  );
  return (result as any).affectedRows > 0;
};

export const getForgotPasswordOtp = async (otp: string): Promise<any> => {
  const [result] = await pool.execute(
    "SELECT * FROM users_forgot_password_otps WHERE otp = ? AND expires_at > ?",
    [otp, new Date()]
  );
  return (result as any)[0];
};

export const deleteForgotPasswordOtp = async (otp: string): Promise<void> => {
  await pool.execute("DELETE FROM users_forgot_password_otps WHERE otp = ?", [
    otp,
  ]);
};

export const checkUserExistStatus = async (
  userId: number
): Promise<boolean> => {
  const [result] = await pool.execute("SELECT * FROM users WHERE id = ?", [
    userId,
  ]);
  return (result as any).length > 0;
};

export const createUserScore = async (userId: number, score: number) => {
  const [result] = await pool.execute(
    "INSERT INTO users_scores (user_id,score) VALUES (?,?)",
    [userId, score]
  );
  return (result as any).affectedRows > 0;
};

export const getUserLatestScore = async (
  userId: number
): Promise<UserScore> => {
  const [result] = await pool.execute<UserScore[]>(
    "SELECT * FROM users_scores WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [userId]
  );
  return result[0];
};
