import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";

import {
  HTTP_MESSAGES,
  HTTP_RESPONSE_MESSAGES,
  HTTP_STATUS,
} from "../constants/httpConstants";
import { updateUserLevel } from "../repositories/userRepository";
import {
  checkEmailExistStatus,
  checkUserExistStatusService,
  createfeedback,
  createInitialPainDetails,
  createUserScoreService,
  deleteEmailVerificationTokenService,
  deleteForgotPasswordOtpService,
  getEmailVerificationTokenService,
  getForgotPasswordOtpService,
  getInitialPainDetails,
  getUserAllDetails,
  getUserByEmailAddress,
  getUserExerciseReportByDateService,
  getUserExerciseReportByTimeService,
  getUserLatestScoreService,
  getUserProfileDetails,
  createNewUser as newUser,
  saveEmailVerificationTokens,
  saveForgotPasswordOtpService,
  updateEmailVerificationStatusService,
  updateUserEmailService,
  updateUserFirstNameService,
  updateUserLastNameService,
  updateUserPasswordService,
} from "../services/userService";
import { APIRequest, APIResponse } from "../types/custom";
import {
  sendEmailVerificationLink,
  sendForgotPasswordOtp,
} from "../utils/emailSender";
import { hashOTP } from "../utils/hashOtp";
import { errorResponse, successResponse } from "../utils/response";
import { generateUniqueToken } from "../utils/uniqueTokenGenerator";
import {
  calculateUserInitialLevel,
  calculateUserUpdatedLevel,
} from "../utils/userLevelCalculator";
import { generateAccessToken } from "../utils/userToken";
import {
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInUserSchema,
  updateUserDetailsSchema,
  userFeedbackSchema,
  userInitialPainSchema,
  verifyResetPasswordOtpSchema,
} from "../validations/userValidations";

export const signUpUser = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const user = req.body;

    const { error } = createUserSchema.validate(user);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: error.details[0].message,
        })
      );
    }

    const isUserExist = await checkEmailExistStatus(user.email);

    if (isUserExist) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.EMAIL_ALREADY_EXIST,
        })
      );
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const createdUser = await newUser({
      ...user,
      password: hashedPassword,
    });

    const emailVerificationToken = generateUniqueToken(64);

    await saveEmailVerificationTokens(createdUser.id!, emailVerificationToken);

    await sendEmailVerificationLink(
      createdUser.first_name,
      createdUser.email,
      emailVerificationToken
    );

    return res.status(HTTP_STATUS.CREATED).json(
      successResponse({
        status: HTTP_STATUS.CREATED,
        message: HTTP_RESPONSE_MESSAGES.USER_CREATED,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const signInUser = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const { email, password } = req.body;

    const { error } = signInUserSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: error.details[0].message,
        })
      );
    }

    const existUser = await getUserByEmailAddress(email);

    if (!existUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.EMAIL_NOT_EXIST,
        })
      );
    }

    const isPasswordValid = await bcrypt.compare(password, existUser.password);

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_EMAIL_OR_PASSWORD,
        })
      );
    }

    if (!existUser.id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    if (!existUser.is_email_verified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.EMAIL_NOT_VERIFIED,
        })
      );
    }

    const initialPainDetails = await getInitialPainDetails(existUser.id);

    const accessToken = generateAccessToken(existUser.id, existUser.email);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({
        status: HTTP_STATUS.OK,
        message: HTTP_RESPONSE_MESSAGES.USER_SIGN_IN,
        data: {
          is_first_time_login: !initialPainDetails,
          access_token: accessToken,
        },
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const getStarted = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const userId = req.userId;

    const {
      type_of_injury,
      injury_occured,
      diagnosed_by_medical_professional,
      pain_level,
      stiffness,
      swelling,
      has_pain_during_daily_activities,
      had_surgery,
      surgery_date,
      is_get_physiotherapy_before,
      physiothrtapy_description,
      is_previous_physiotherapy_completed,
    } = req.body;

    const { error } = userInitialPainSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: error.details[0].message,
        })
      );
    }

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    const initialPainDetails = await getInitialPainDetails(userId);

    if (initialPainDetails) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INITIAL_PAIN_ALREADY_ADDED,
        })
      );
    }

    await createInitialPainDetails({
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

    const userInitialLevel = calculateUserInitialLevel({
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

    await updateUserLevel(userId, userInitialLevel.level);
    await createUserScoreService(userId, userInitialLevel.score);

    return res.status(HTTP_STATUS.CREATED).json(
      successResponse({
        status: HTTP_STATUS.CREATED,
        message: HTTP_RESPONSE_MESSAGES.USER_INITIAL_PAIN_ADDED,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const getUserProfile = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    const isUserExist = await checkUserExistStatusService(userId);

    if (!isUserExist) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    const userProfile = await getUserProfileDetails(userId);
    const initialPainDetails = await getInitialPainDetails(userId);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({
        status: HTTP_STATUS.OK,
        message: HTTP_RESPONSE_MESSAGES.USER_DETAILS_FETCHED,
        data: {
          user_profile_details: userProfile,
          initial_pain_details: initialPainDetails,
        },
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const createUserFeedback = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const userId = req.userId;

    const {
      pain_level,
      swelling,
      stiffness,
      fatigue_level,
      strength_perception,
      functional_improvement,
      exercise_tolerance,
    } = req.body;

    const { error } = userFeedbackSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: error.details[0].message,
        })
      );
    }

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    const profileDetails = await getUserProfileDetails(userId);

    // const score = calculateUserPainLevel({
    //   pain_level,
    //   swelling,
    //   stiffness,
    //   fatigue_level,
    // });

    const userScoreDetails = await getUserLatestScoreService(userId);

    const userUpdatedLevelAndScoreDetails = calculateUserUpdatedLevel(
      profileDetails.level,
      userScoreDetails.score,
      req.body
    );

    if (userUpdatedLevelAndScoreDetails.level > 10) {
      await updateUserLevel(userId, 10);
    } else if (userUpdatedLevelAndScoreDetails.level < 1) {
      await updateUserLevel(userId, 1);
    } else {
      await updateUserLevel(userId, userUpdatedLevelAndScoreDetails.level);
    }

    await createUserScoreService(userId, userUpdatedLevelAndScoreDetails.score);

    await createfeedback({
      user_id: userId,
      pain_level,
      swelling,
      stiffness,
      fatigue_level,
      strength_perception,
      functional_improvement,
      exercise_tolerance,
    });

    return res.status(HTTP_STATUS.CREATED).json(
      successResponse({
        status: HTTP_STATUS.CREATED,
        message: HTTP_RESPONSE_MESSAGES.USER_FEEDBACK_ADDED,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const verifyEmail = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const { token } = req.params;

    if (!token) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(HTTP_RESPONSE_MESSAGES.INVALID_OR_EXPIRED_LINK);
    }

    const existToken = await getEmailVerificationTokenService(token);

    if (!existToken) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(HTTP_RESPONSE_MESSAGES.INVALID_OR_EXPIRED_LINK);
    }

    await updateEmailVerificationStatusService(existToken.user_id);

    await deleteEmailVerificationTokenService(token);

    return res
      .status(HTTP_STATUS.OK)
      .send(HTTP_RESPONSE_MESSAGES.EMAIL_VERIFIED);
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const requestEmailverificationLink = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    const existUserDetails = await getUserProfileDetails(userId);

    if (!existUserDetails) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    if (existUserDetails.is_email_verified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED,
        })
      );
    }

    const emailVerificationToken = generateUniqueToken(64);

    await saveEmailVerificationTokens(userId, emailVerificationToken);

    await sendEmailVerificationLink(
      existUserDetails.first_name,
      existUserDetails.email,
      emailVerificationToken
    );

    return res.status(HTTP_STATUS.OK).json(
      successResponse({
        status: HTTP_STATUS.OK,
        message: HTTP_RESPONSE_MESSAGES.EMAIL_VERIFICATION_LINK_SENT,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const getUserExerciseReport = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    const isUserExist = await checkUserExistStatusService(userId);

    if (!isUserExist) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    const reportData = await getUserExerciseReportByDateService(userId);
    const reportDataByTime = await getUserExerciseReportByTimeService(userId);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({
        status: HTTP_STATUS.OK,
        message: HTTP_RESPONSE_MESSAGES.USER_EXERCISES_DETAILS_FETCHED,
        data: {
          report_data: reportData,
          report_data_by_time: reportDataByTime,
        },
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const updateUserProfileDetails = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const userId = req.userId;

    const { first_name, last_name, email, old_password, new_password } =
      req.body;

    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    const { error } = updateUserDetailsSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: error.details[0].message,
        })
      );
    }

    const existUserDetails = await getUserAllDetails(userId);

    if (!existUserDetails) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }

    if (email) {
      if (email !== existUserDetails.email) {
        const isUserExist = await checkEmailExistStatus(email);

        if (isUserExist) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            errorResponse({
              status: HTTP_STATUS.BAD_REQUEST,
              message: HTTP_MESSAGES.BAD_REQUEST,
              error: HTTP_RESPONSE_MESSAGES.EMAIL_ALREADY_EXIST,
            })
          );
        }
      }
    }

    const isPasswordValid = await bcrypt.compare(
      old_password,
      existUserDetails.password
    );

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_CREDENTIALS,
        })
      );
    }

    //! Update first name
    if (first_name) {
      await updateUserFirstNameService(userId, first_name);
    }

    //! Update last name
    if (last_name) {
      await updateUserLastNameService(userId, last_name);
    }

    //! Update email
    if (email) {
      await updateUserEmailService(userId, email);
    }

    //! Update password
    if (new_password) {
      const hashedPassword = await bcrypt.hash(new_password, 10);

      await updateUserPasswordService(userId, hashedPassword);
    }

    return res.status(HTTP_STATUS.OK).json(
      successResponse({
        status: HTTP_STATUS.OK,
        message: HTTP_RESPONSE_MESSAGES.USER_DETAILS_UPDATED,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const forgotPassword = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const { email } = req.body;

    const { error } = forgotPasswordSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: error.details[0].message,
        })
      );
    }

    const existUserDetails = await getUserByEmailAddress(email);

    if (!existUserDetails) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.EMAIL_NOT_EXIST,
        })
      );
    }

    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP: ", otp);

    const hashedOtp = hashOTP(otp);

    await saveForgotPasswordOtpService(existUserDetails.id!, hashedOtp);

    await sendForgotPasswordOtp(email, otp);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({
        status: HTTP_STATUS.OK,
        message: HTTP_RESPONSE_MESSAGES.FORGOT_PASSWORD_OTP_SENT,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const verifyResetPasswordOtp = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const { otp } = req.body;

    const { error } = verifyResetPasswordOtpSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: error.details[0].message,
        })
      );
    }

    const hashedOtp = hashOTP(otp);

    const isExistOtp = await getForgotPasswordOtpService(hashedOtp);

    if (!isExistOtp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_OTP,
        })
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      successResponse({
        status: HTTP_STATUS.OK,
        message: HTTP_RESPONSE_MESSAGES.VALID_OTP,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const resetPassword = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const { new_password, otp } = req.body;

    const { error } = resetPasswordSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: error.details[0].message,
        })
      );
    }

    const hashedOtp = hashOTP(otp);

    const isExistOtp = await getForgotPasswordOtpService(hashedOtp);

    if (!isExistOtp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_OTP,
        })
      );
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await updateUserPasswordService(isExistOtp.user_id, hashedPassword);
    await deleteForgotPasswordOtpService(hashedOtp);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({
        status: HTTP_STATUS.OK,
        message: HTTP_RESPONSE_MESSAGES.PASSWORD_RESET_SUCCESS,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export const verifyToken = async (
  req: APIRequest,
  res: APIResponse
): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({
          status: HTTP_STATUS.BAD_REQUEST,
          message: HTTP_MESSAGES.BAD_REQUEST,
          error: HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS,
        })
      );
    }
    return res.status(HTTP_STATUS.OK).json(
      successResponse({
        status: HTTP_STATUS.OK,
        message: HTTP_RESPONSE_MESSAGES.TOKEN_VERIFIED,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: HTTP_MESSAGES.INTERNAL_SERVER_ERROR,
      })
    );
  }
};
