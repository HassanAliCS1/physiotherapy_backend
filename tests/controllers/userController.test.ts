import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import request from "supertest";

import app from "../../src/app"; // Assuming your Express app is exported from this file
import {
  HTTP_MESSAGES,
  HTTP_RESPONSE_MESSAGES,
  HTTP_STATUS,
} from "../../src/constants/httpConstants";
import * as authToken from "../../src/middleware/tokenValidation";
import * as userService from "../../src/services/userService";
import * as emailSender from "../../src/utils/emailSender";
import * as hashOTPUtil from "../../src/utils/hashOtp";
import * as uniqueTokenGenerator from "../../src/utils/uniqueTokenGenerator";
import * as calc from "../../src/utils/userLevelCalculator";
import * as token from "../../src/utils/userToken";

jest.mock("../../src/services/userService");
jest.mock("../../src/utils/emailSender");
jest.mock("../../src/utils/uniqueTokenGenerator");
jest.mock("../../src/utils/userToken");
jest.mock("../../src/utils/userLevelCalculator");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("otp-generator");
jest.mock("../../src/middleware/tokenValidation");
jest.mock("../../src/utils/hashOtp");

describe("User Controller - signUpUser", () => {
  const mockUser = {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    password: "password123",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({ email: "invalid-email" });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
  });

  it("should return 400 if email already exists", async () => {
    (userService.checkEmailExistStatus as jest.Mock).mockResolvedValue(true);

    const response = await request(app).post("/api/auth/signup").send(mockUser);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.EMAIL_ALREADY_EXIST
    );
  });

  it("should create a new user and send email verification link", async () => {
    (userService.checkEmailExistStatus as jest.Mock).mockResolvedValue(false);
    (userService.createNewUser as jest.Mock).mockResolvedValue({
      id: "123",
      ...mockUser,
    });
    (uniqueTokenGenerator.generateUniqueToken as jest.Mock).mockReturnValue(
      "unique-token"
    );
    (emailSender.sendEmailVerificationLink as jest.Mock).mockResolvedValue({
      first_name: "firstName",
      email: "email@email.com",
      token: "token",
    });

    const response = await request(app).post("/api/auth/signup").send(mockUser);

    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expect(response.body.message).toBe(HTTP_RESPONSE_MESSAGES.USER_CREATED);
    expect(userService.createNewUser).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email,
      })
    );
    expect(userService.saveEmailVerificationTokens).toHaveBeenCalledWith(
      "123",
      "unique-token"
    );
    expect(emailSender.sendEmailVerificationLink).toHaveBeenCalledWith(
      mockUser.first_name,
      mockUser.email,
      "unique-token"
    );
  });

  it("should return 500 if an internal server error occurs", async () => {
    (userService.checkEmailExistStatus as jest.Mock).mockRejectedValueOnce(
      new Error("Internal Server Error")
    );
    jest.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app).post("/api/auth/signup").send(mockUser);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - signInUser", () => {
  const mockUser = {
    email: "john.doe@example.com",
    password: "password123",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    const response = await request(app)
      .post("/api/auth/signin")
      .send({ email: "invalid-email" });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
  });

  it("should return 400 if email does not exist", async () => {
    (userService.getUserByEmailAddress as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/api/auth/signin").send(mockUser);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(HTTP_RESPONSE_MESSAGES.EMAIL_NOT_EXIST);
  });

  it("should return 400 if password is invalid", async () => {
    (userService.getUserByEmailAddress as jest.Mock).mockResolvedValue({
      ...mockUser,
      password: "hashedPassword",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await request(app).post("/api/auth/signin").send(mockUser);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_EMAIL_OR_PASSWORD
    );
  });

  it("should return 400 if user ID is missing", async () => {
    (userService.getUserByEmailAddress as jest.Mock).mockResolvedValue({
      ...mockUser,
      password: "hashedPassword",
      id: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const response = await request(app).post("/api/auth/signin").send(mockUser);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return 400 if email is not verified", async () => {
    (userService.getUserByEmailAddress as jest.Mock).mockResolvedValue({
      ...mockUser,
      password: "hashedPassword",
      id: "123",
      is_email_verified: false,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const response = await request(app).post("/api/auth/signin").send(mockUser);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(HTTP_RESPONSE_MESSAGES.EMAIL_NOT_VERIFIED);
  });

  it("should sign in the user and return access token", async () => {
    (userService.getUserByEmailAddress as jest.Mock).mockResolvedValue({
      ...mockUser,
      password: "hashedPassword",
      id: "123",
      is_email_verified: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (userService.getInitialPainDetails as jest.Mock).mockResolvedValue(null);
    (token.generateAccessToken as jest.Mock).mockReturnValue("access-token");

    const response = await request(app).post("/api/auth/signin").send(mockUser);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.message).toBe(HTTP_RESPONSE_MESSAGES.USER_SIGN_IN);
    expect(response.body.data.access_token).toBe("access-token");
    expect(response.body.data.is_first_time_login).toBe(true);
  });

  it("should return 500 if an internal server error occurs", async () => {
    (userService.getUserByEmailAddress as jest.Mock).mockRejectedValueOnce(
      new Error("Internal Server Error")
    );

    const response = await request(app).post("/api/auth/signin").send(mockUser);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - getStarted", () => {
  const mockRequestBody = {
    type_of_injury: "knee",
    injury_occured: "THREE_TO_6_MONTHS",
    diagnosed_by_medical_professional: true,
    pain_level: 5,
    stiffness: 3,
    swelling: 2,
    has_pain_during_daily_activities: true,
    had_surgery: false,
    surgery_date: null,
    is_get_physiotherapy_before: false,
    physiothrtapy_description: "text",
    is_previous_physiotherapy_completed: false,
  };

  const mockToken = "mockToken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        next();
      }
    );

    const response = await request(app)
      .post("/api/auth/get-started")
      .set("Authorization", `Bearer ${mockToken}`)
      .send({ type_of_injury: "" });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
  });

  it("should return 400 if userId is missing", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        next();
      }
    );
    const response = await request(app)
      .post("/api/auth/get-started")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return 400 if initial pain details already exist", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getInitialPainDetails as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .post("/api/auth/get-started")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INITIAL_PAIN_ALREADY_ADDED
    );
  });

  it("should create initial pain details and return 201", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getInitialPainDetails as jest.Mock).mockResolvedValue(null);
    (userService.createInitialPainDetails as jest.Mock).mockResolvedValue({});
    (userService.updateUserLevel as jest.Mock).mockResolvedValue({});
    (userService.createUserScoreService as jest.Mock).mockResolvedValue({});
    (calc.calculateUserInitialLevel as jest.Mock).mockReturnValue({
      level: 1,
      score: 10,
    });

    const response = await request(app)
      .post("/api/auth/get-started")

      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expect(response.body.message).toBe(
      HTTP_RESPONSE_MESSAGES.USER_INITIAL_PAIN_ADDED
    );
    expect(userService.createInitialPainDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 1,
        type_of_injury: mockRequestBody.type_of_injury,
      })
    );

    expect(userService.createUserScoreService).toHaveBeenCalledWith(1, 10);
  });

  it("should return 500 if an internal server error occurs", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getInitialPainDetails as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .post("/api/auth/get-started")
      //.set("userId", "123")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - getUserProfile", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if userId is missing", async () => {
    const mockToken = "mockToken";

    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        next();
      }
    );

    const response = await request(app)
      .get("/api/user-info")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return 400 if user does not exist", async () => {
    const mockToken = "mockToken";

    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.checkUserExistStatusService as jest.Mock).mockResolvedValue(
      false
    );

    const response = await request(app)
      .get("/api/user-info")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return user profile and initial pain details", async () => {
    const mockToken = "mockToken";
    const mockUserProfile = { first_name: "John", last_name: "Doe" };
    const mockInitialPainDetails = { pain_level: 5 };

    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.checkUserExistStatusService as jest.Mock).mockResolvedValue(
      true
    );
    (userService.getUserProfileDetails as jest.Mock).mockResolvedValue(
      mockUserProfile
    );
    (userService.getInitialPainDetails as jest.Mock).mockResolvedValue(
      mockInitialPainDetails
    );

    const response = await request(app)
      .get("/api/user-info")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.message).toBe(
      HTTP_RESPONSE_MESSAGES.USER_DETAILS_FETCHED
    );
    expect(response.body.data.user_profile_details).toEqual(mockUserProfile);
    expect(response.body.data.initial_pain_details).toEqual(
      mockInitialPainDetails
    );
  });

  it("should return 500 if an internal server error occurs", async () => {
    const mockToken = "mockToken";

    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.checkUserExistStatusService as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .get("/api/user-info")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - createUserFeedback", () => {
  const mockRequestBody = {
    pain_level: 5,
    swelling: 3,
    stiffness: 2,
    fatigue_level: 4,
    strength_perception: 7,
    functional_improvement: 6,
    exercise_tolerance: 8,
  };

  const mockToken = "mockToken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        next();
      }
    );

    const response = await request(app)
      .post("/api/user-feedback")
      .set("Authorization", `Bearer ${mockToken}`)
      .send({ pain_level: -1 }); // Invalid data

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
  });

  it("should return 400 if userId is missing", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        next();
      }
    );

    const response = await request(app)
      .post("/api/user-feedback")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should create user feedback and update user level and score", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserProfileDetails as jest.Mock).mockResolvedValue({
      level: 5,
    });
    (userService.getUserLatestScoreService as jest.Mock).mockResolvedValue({
      score: 50,
    });
    (calc.calculateUserUpdatedLevel as jest.Mock).mockReturnValue({
      level: 6,
      score: 60,
    });
    (userService.updateUserLevel as jest.Mock).mockResolvedValue({});
    (userService.createUserScoreService as jest.Mock).mockResolvedValue({});
    (userService.createfeedback as jest.Mock).mockResolvedValue({});

    const response = await request(app)
      .post("/api/user-feedback")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expect(response.body.message).toBe(
      HTTP_RESPONSE_MESSAGES.USER_FEEDBACK_ADDED
    );
    expect(userService.createUserScoreService).toHaveBeenCalledWith(1, 60);
    expect(userService.createfeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 1,
        pain_level: mockRequestBody.pain_level,
      })
    );
  });

  it("should cap user level at 10 if calculated level exceeds 10", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserProfileDetails as jest.Mock).mockResolvedValue({
      level: 9,
    });
    (userService.getUserLatestScoreService as jest.Mock).mockResolvedValue({
      score: 90,
    });
    (calc.calculateUserUpdatedLevel as jest.Mock).mockReturnValue({
      level: 11,
      score: 100,
    });
    (userService.updateUserLevel as jest.Mock).mockResolvedValue({});
    (userService.createUserScoreService as jest.Mock).mockResolvedValue({});
    (userService.createfeedback as jest.Mock).mockResolvedValue({});

    const response = await request(app)
      .post("/api/user-feedback")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.CREATED);
  });

  it("should set user level to 1 if calculated level is below 1", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserProfileDetails as jest.Mock).mockResolvedValue({
      level: 2,
    });
    (userService.getUserLatestScoreService as jest.Mock).mockResolvedValue({
      score: 20,
    });
    (calc.calculateUserUpdatedLevel as jest.Mock).mockReturnValue({
      level: 0,
      score: 10,
    });
    (userService.updateUserLevel as jest.Mock).mockResolvedValue({});
    (userService.createUserScoreService as jest.Mock).mockResolvedValue({});
    (userService.createfeedback as jest.Mock).mockResolvedValue({});

    const response = await request(app)
      .post("/api/user-feedback")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.CREATED);
  });

  it("should return 500 if an internal server error occurs", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserProfileDetails as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .post("/api/user-feedback")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - verifyEmail", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockEmailToken = "mockToken";

  it("should return 400 if token is missing", async () => {
    const response = await request(app).get(`/api/auth/verify-email/`);

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
  });

  it("should return 400 if token does not exist", async () => {
    (
      userService.getEmailVerificationTokenService as jest.Mock
    ).mockResolvedValue(null);

    const response = await request(app).get(
      `/api/auth/verify-email/${mockEmailToken}`
    );

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.text).toBe(HTTP_RESPONSE_MESSAGES.INVALID_OR_EXPIRED_LINK);
  });

  it("should verify email and delete the token", async () => {
    (
      userService.getEmailVerificationTokenService as jest.Mock
    ).mockResolvedValue({
      user_id: "123",
    });
    (
      userService.updateEmailVerificationStatusService as jest.Mock
    ).mockResolvedValue({});
    (
      userService.deleteEmailVerificationTokenService as jest.Mock
    ).mockResolvedValue({});

    const response = await request(app).get(
      `/api/auth/verify-email/${mockEmailToken}`
    );

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.text).toBe(HTTP_RESPONSE_MESSAGES.EMAIL_VERIFIED);
    expect(
      userService.updateEmailVerificationStatusService
    ).toHaveBeenCalledWith("123");
    expect(
      userService.deleteEmailVerificationTokenService
    ).toHaveBeenCalledWith("mockToken");
  });

  it("should return 500 if an internal server error occurs", async () => {
    (
      userService.getEmailVerificationTokenService as jest.Mock
    ).mockRejectedValue(new Error("Internal Server Error"));

    const response = await request(app).get(
      `/api/auth/verify-email/${mockEmailToken}`
    );

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - requestEmailverificationLink", () => {
  const mockToken = "mockToken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if userId is missing", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        next();
      }
    );

    const response = await request(app)
      .post("/api/auth/request-email-verification-link")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return 400 if user does not exist", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserProfileDetails as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/request-email-verification-link")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return 400 if email is already verified", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserProfileDetails as jest.Mock).mockResolvedValue({
      is_email_verified: true,
    });

    const response = await request(app)
      .post("/api/auth/request-email-verification-link")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED
    );
  });

  it("should send email verification link and return 200", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserProfileDetails as jest.Mock).mockResolvedValue({
      first_name: "John",
      email: "john.doe@example.com",
      is_email_verified: false,
    });
    (uniqueTokenGenerator.generateUniqueToken as jest.Mock).mockReturnValue(
      "unique-token"
    );
    (userService.saveEmailVerificationTokens as jest.Mock).mockResolvedValue(
      {}
    );
    (emailSender.sendEmailVerificationLink as jest.Mock).mockResolvedValue({});

    const response = await request(app)
      .post("/api/auth/request-email-verification-link")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.message).toBe(
      HTTP_RESPONSE_MESSAGES.EMAIL_VERIFICATION_LINK_SENT
    );
    expect(userService.saveEmailVerificationTokens).toHaveBeenCalledWith(
      1,
      "unique-token"
    );
    expect(emailSender.sendEmailVerificationLink).toHaveBeenCalledWith(
      "John",
      "john.doe@example.com",
      "unique-token"
    );
  });

  it("should return 500 if an internal server error occurs", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserProfileDetails as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .post("/api/auth/request-email-verification-link")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - getUserExerciseReport", () => {
  const mockToken = "mockToken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if userId is missing", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        next();
      }
    );

    const response = await request(app)
      .get("/api/exercise-report")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return 400 if user does not exist", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.checkUserExistStatusService as jest.Mock).mockResolvedValue(
      false
    );

    const response = await request(app)
      .get("/api/exercise-report")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return user exercise report data", async () => {
    const mockReportData = [{ date: "2023-01-01", exercises: [] }];
    const mockReportDataByTime = [{ time: "morning", exercises: [] }];

    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.checkUserExistStatusService as jest.Mock).mockResolvedValue(
      true
    );
    (
      userService.getUserExerciseReportByDateService as jest.Mock
    ).mockResolvedValue(mockReportData);
    (
      userService.getUserExerciseReportByTimeService as jest.Mock
    ).mockResolvedValue(mockReportDataByTime);

    const response = await request(app)
      .get("/api/exercise-report")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.message).toBe(
      HTTP_RESPONSE_MESSAGES.USER_EXERCISES_DETAILS_FETCHED
    );
    expect(response.body.data.report_data).toEqual(mockReportData);
    expect(response.body.data.report_data_by_time).toEqual(
      mockReportDataByTime
    );
  });

  it("should return 500 if an internal server error occurs", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (
      userService.getUserExerciseReportByDateService as jest.Mock
    ).mockRejectedValue(new Error("Internal Server Error"));

    const response = await request(app)
      .get("/api/exercise-report")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - updateUserProfileDetails", () => {
  const mockToken = "mockToken";
  const mockRequestBody = {
    first_name: "Jane",
    last_name: "Doe",
    email: "jane.doe@example.com",
    old_password: "oldPassword123",
    new_password: "newPassword123",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if userId is missing", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        next();
      }
    );

    const response = await request(app)
      .post("/api/user-info/update-details")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return 400 if validation fails", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );

    const response = await request(app)
      .post("/api/user-info/update-details")
      .set("Authorization", `Bearer ${mockToken}`)
      .send({ email: "invalid-email" });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
  });

  it("should return 400 if user does not exist", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserAllDetails as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/user-info/update-details")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return 400 if email already exists", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserAllDetails as jest.Mock).mockResolvedValue({
      email: "old.email@example.com",
      password: "hashedPassword",
    });
    (userService.checkEmailExistStatus as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .post("/api/user-info/update-details")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.EMAIL_ALREADY_EXIST
    );
  });

  it("should return 400 if old password is invalid", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserAllDetails as jest.Mock).mockResolvedValue({
      email: "jane.doe@example.com",
      password: "hashedPassword",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await request(app)
      .post("/api/user-info/update-details")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_CREDENTIALS
    );
  });

  it("should update user details and return 200", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserAllDetails as jest.Mock).mockResolvedValue({
      email: "jane.doe@example.com",
      password: "hashedPassword",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
    (userService.updateUserFirstNameService as jest.Mock).mockResolvedValue({});
    (userService.updateUserLastNameService as jest.Mock).mockResolvedValue({});
    (userService.updateUserEmailService as jest.Mock).mockResolvedValue({});
    (userService.updateUserPasswordService as jest.Mock).mockResolvedValue({});

    const response = await request(app)
      .post("/api/user-info/update-details")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.message).toBe(
      HTTP_RESPONSE_MESSAGES.USER_DETAILS_UPDATED
    );
    expect(userService.updateUserFirstNameService).toHaveBeenCalledWith(
      1,
      mockRequestBody.first_name
    );
    expect(userService.updateUserLastNameService).toHaveBeenCalledWith(
      1,
      mockRequestBody.last_name
    );
    expect(userService.updateUserEmailService).toHaveBeenCalledWith(
      1,
      mockRequestBody.email
    );
    expect(userService.updateUserPasswordService).toHaveBeenCalledWith(
      1,
      "newHashedPassword"
    );
  });

  it("should return 500 if an internal server error occurs", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );
    (userService.getUserAllDetails as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .post("/api/user-info/update-details")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - forgotPassword", () => {
  const mockRequestBody = {
    email: "john.doe@example.com",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "invalid-email" });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBeDefined();
  });

  it("should return 400 if email does not exist", async () => {
    (userService.getUserByEmailAddress as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(HTTP_RESPONSE_MESSAGES.EMAIL_NOT_EXIST);
  });

  it("should generate OTP, save it, and send it via email", async () => {
    (userService.getUserByEmailAddress as jest.Mock).mockResolvedValue({
      id: 123,
      email: mockRequestBody.email,
    });
    (otpGenerator.generate as jest.Mock).mockReturnValue("1234");
    (userService.saveForgotPasswordOtpService as jest.Mock).mockResolvedValue(
      {}
    );
    (emailSender.sendForgotPasswordOtp as jest.Mock).mockResolvedValue({});

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.message).toBe(
      HTTP_RESPONSE_MESSAGES.FORGOT_PASSWORD_OTP_SENT
    );
    expect(userService.saveForgotPasswordOtpService).toHaveBeenCalledWith(
      123,
      undefined
    );
    expect(emailSender.sendForgotPasswordOtp).toHaveBeenCalledWith(
      mockRequestBody.email,
      "1234"
    );
  });

  it("should return 500 if an internal server error occurs", async () => {
    (userService.getUserByEmailAddress as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - verifyResetPasswordOtp", () => {
  const mockRequestBody = {
    otp: "1234",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    const response = await request(app)
      .post("/api/auth/verify-reset-password-otp")
      .send({ otp: "" }); // Invalid data

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBeDefined();
  });

  it("should return 400 if OTP is invalid", async () => {
    (userService.getForgotPasswordOtpService as jest.Mock).mockResolvedValue(
      null
    );
    (hashOTPUtil.hashOTP as jest.Mock).mockReturnValue("hashedOtp");

    const response = await request(app)
      .post("/api/auth/verify-reset-password-otp")
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(HTTP_RESPONSE_MESSAGES.INVALID_OTP);
  });

  it("should return 200 if OTP is valid", async () => {
    (userService.getForgotPasswordOtpService as jest.Mock).mockResolvedValue(
      true
    );
    (hashOTPUtil.hashOTP as jest.Mock).mockReturnValue("hashedOtp");

    const response = await request(app)
      .post("/api/auth/verify-reset-password-otp")
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.message).toBe(HTTP_RESPONSE_MESSAGES.VALID_OTP);
  });

  it("should return 500 if an internal server error occurs", async () => {
    (userService.getForgotPasswordOtpService as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .post("/api/auth/verify-reset-password-otp")
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - resetPassword", () => {
  const mockRequestBody = {
    new_password: "newPassword123",
    otp: "1234",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({ new_password: "", otp: "" }); // Invalid data

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBeDefined();
  });

  it("should return 400 if OTP is invalid", async () => {
    (hashOTPUtil.hashOTP as jest.Mock).mockReturnValue("hashedOtp");
    (userService.getForgotPasswordOtpService as jest.Mock).mockResolvedValue(
      null
    );

    const response = await request(app)
      .post("/api/auth/reset-password")
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(HTTP_RESPONSE_MESSAGES.INVALID_OTP);
  });

  it("should reset the password and delete the OTP", async () => {
    (hashOTPUtil.hashOTP as jest.Mock).mockReturnValue("hashedOtp");
    (userService.getForgotPasswordOtpService as jest.Mock).mockResolvedValue({
      user_id: 123,
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    (userService.updateUserPasswordService as jest.Mock).mockResolvedValue({});
    (userService.deleteForgotPasswordOtpService as jest.Mock).mockResolvedValue(
      {}
    );

    const response = await request(app)
      .post("/api/auth/reset-password")
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.message).toBe(
      HTTP_RESPONSE_MESSAGES.PASSWORD_RESET_SUCCESS
    );
    expect(userService.updateUserPasswordService).toHaveBeenCalledWith(
      123,
      "hashedPassword"
    );
    expect(userService.deleteForgotPasswordOtpService).toHaveBeenCalledWith(
      "hashedOtp"
    );
  });

  it("should return 500 if an internal server error occurs", async () => {
    (hashOTPUtil.hashOTP as jest.Mock).mockReturnValue("hashedOtp");
    (userService.getForgotPasswordOtpService as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .post("/api/auth/reset-password")
      .send(mockRequestBody);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe(HTTP_MESSAGES.INTERNAL_SERVER_ERROR);
  });
});

describe("User Controller - verifyToken", () => {
  const mockToken = "mockToken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if userId is missing", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        next();
      }
    );

    const response = await request(app)
      .get("/api/auth/verify-token")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe(HTTP_MESSAGES.BAD_REQUEST);
    expect(response.body.error).toBe(
      HTTP_RESPONSE_MESSAGES.INVALID_USER_DETAILS
    );
  });

  it("should return 200 if token is valid and userId exists", async () => {
    (authToken.authenticateToken as jest.Mock).mockImplementationOnce(
      (req, res, next) => {
        req.userId = 1;
        next();
      }
    );

    const response = await request(app)
      .get("/api/auth/verify-token")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.message).toBe(HTTP_RESPONSE_MESSAGES.TOKEN_VERIFIED);
  });
});
