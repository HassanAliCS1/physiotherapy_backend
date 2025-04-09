import { UserFeedback } from "../models/userFeedbackModel";
import { CreateUserInitialPainDetails } from "../models/userInitialPainModel";
import { User } from "../models/userModel";
import {
  checkUserEmailExistStatus,
  checkUserExistStatus,
  createUser,
  createUserFeedback,
  createUserInitialPainDetails,
  createUserScore,
  deleteEmailVerificationToken,
  deleteForgotPasswordOtp,
  getEmailVerificationToken,
  getForgotPasswordOtp,
  getUserByEmail,
  getUserById,
  getUserExerciseReportByDate,
  getUserExerciseReportByTime,
  getUserLatestScore,
  getInitialPainDetails as initialPainDetails,
  getUserProfileDetails as profileDetails,
  saveForgotPasswordOtp,
  saveEmailVerificationToken as saveUserEmailVerificationToken,
  updateEmailVerificationStatus,
  updateUserLevel as updateLevel,
  updateUserEmail,
  updateUserFirstName,
  updateUserLastName,
  updateUserPassword,
} from "../repositories/userRepository";

export const createNewUser = async (user: User): Promise<User> => {
  return await createUser(user);
};

export const checkEmailExistStatus = async (
  email: string
): Promise<boolean> => {
  return await checkUserEmailExistStatus(email);
};

export const getUserByEmailAddress = async (email: string): Promise<User> => {
  return await getUserByEmail(email);
};

export const createInitialPainDetails = async (
  painDetails: CreateUserInitialPainDetails
) => {
  return await createUserInitialPainDetails(painDetails);
};

export const getUserProfileDetails = async (userId: number) => {
  return await profileDetails(userId);
};

export const getUserAllDetails = async (userId: number) => {
  return await getUserById(userId);
};

export const getInitialPainDetails = async (userId: number) => {
  return await initialPainDetails(userId);
};

export const updateUserLevel = async (userId: number, level: number) => {
  return await updateLevel(userId, level);
};

export const createfeedback = async (feedback: UserFeedback) => {
  return await createUserFeedback(feedback);
};

export const saveEmailVerificationTokens = async (
  userId: number,
  token: string
) => {
  return await saveUserEmailVerificationToken(userId, token);
};

export const getEmailVerificationTokenService = async (token: string) => {
  return await getEmailVerificationToken(token);
};

export const deleteEmailVerificationTokenService = async (token: string) => {
  return await deleteEmailVerificationToken(token);
};

export const updateEmailVerificationStatusService = async (userId: number) => {
  return await updateEmailVerificationStatus(userId);
};

export const getUserExerciseReportByDateService = async (
  userId: number
): Promise<any> => {
  return await getUserExerciseReportByDate(userId);
};

export const getUserExerciseReportByTimeService = async (
  userId: number
): Promise<any> => {
  return await getUserExerciseReportByTime(userId);
};

export const updateUserFirstNameService = async (
  userId: number,
  firstName: string
): Promise<boolean> => {
  return await updateUserFirstName(userId, firstName);
};

export const updateUserLastNameService = async (
  userId: number,
  lastName: string
): Promise<boolean> => {
  return await updateUserLastName(userId, lastName);
};

export const updateUserEmailService = async (
  userId: number,
  email: string
): Promise<boolean> => {
  return await updateUserEmail(userId, email);
};

export const updateUserPasswordService = async (
  userId: number,
  password: string
): Promise<boolean> => {
  return await updateUserPassword(userId, password);
};

export const saveForgotPasswordOtpService = async (
  userId: number,
  token: string
) => {
  return await saveForgotPasswordOtp(userId, token);
};

export const getForgotPasswordOtpService = async (token: string) => {
  return await getForgotPasswordOtp(token);
};

export const deleteForgotPasswordOtpService = async (token: string) => {
  return await deleteForgotPasswordOtp(token);
};

export const checkUserExistStatusService = async (
  userId: number
): Promise<boolean> => {
  return await checkUserExistStatus(userId);
};

export const createUserScoreService = async (userId: number, score: number) => {
  return await createUserScore(userId, score);
};

export const getUserLatestScoreService = async (userId: number) => {
  return await getUserLatestScore(userId);
};
