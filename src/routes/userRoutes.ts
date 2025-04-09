import express from "express";

import {
  createUserFeedback,
  forgotPassword,
  getStarted,
  getUserExerciseReport,
  getUserProfile,
  requestEmailverificationLink,
  resetPassword,
  signInUser,
  signUpUser,
  updateUserProfileDetails,
  verifyEmail,
  verifyResetPasswordOtp,
  verifyToken,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/tokenValidation";

const router = express.Router();

router.post("/auth/signup", signUpUser);
router.post("/auth/signin", signInUser);
router.post("/auth/forgot-password", forgotPassword);
router.get("/auth/verify-token", authenticateToken, verifyToken);
router.post("/auth/verify-reset-password-otp", verifyResetPasswordOtp);
router.post("/auth/reset-password/", resetPassword);
router.post("/auth/get-started", authenticateToken, getStarted);
router.get("/auth/verify-email/:token", verifyEmail);
router.post(
  "/auth/request-email-verification-link",
  authenticateToken,
  requestEmailverificationLink
);
router.get("/user-info", authenticateToken, getUserProfile);
router.post("/user-feedback", authenticateToken, createUserFeedback);
router.get("/exercise-report", authenticateToken, getUserExerciseReport);
router.post(
  "/user-info/update-details",
  authenticateToken,
  updateUserProfileDetails
);

export default router;
