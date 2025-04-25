import pool from "../../src/config/db";
import { User } from "../../src/models/userModel";
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
  getInitialPainDetails,
  getUserByEmail,
  getUserById,
  getUserExerciseReportByDate,
  getUserLatestScore,
  getUserProfileDetails,
  saveEmailVerificationToken,
  saveForgotPasswordOtp,
  updateEmailVerificationStatus,
  updateUserEmail,
  updateUserFirstName,
  updateUserLastName,
  updateUserLevel,
  updateUserPassword,
} from "../../src/repositories/userRepository";

jest.mock("../../src/config/db");

describe("User Repository - createUser", () => {
  it("should create a new user and return the user with the generated ID", async () => {
    const mockUser = {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      password: "password123",
    } as User;

    const mockResult = [{ insertId: 1 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await createUser(mockUser);

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [
        mockUser.first_name,
        mockUser.last_name,
        mockUser.email,
        mockUser.password,
      ]
    );
    expect(result).toEqual({ id: 1, ...mockUser });
  });

  it("should throw an error if the database query fails", async () => {
    const mockUser = {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane.doe@example.com",
      password: "password123",
    } as User;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(createUser(mockUser)).rejects.toThrow("Database error");
    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [
        mockUser.first_name,
        mockUser.last_name,
        mockUser.email,
        mockUser.password,
      ]
    );
  });
});

describe("User Repository - checkUserEmailExistStatus", () => {
  it("should return true if the email exists in the database", async () => {
    const mockEmail = "existing.email@example.com";
    const mockResult = [[{ id: 1, email: mockEmail }]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await checkUserEmailExistStatus(mockEmail);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      [mockEmail]
    );
    expect(result).toBe(true);
  });

  it("should return false if the email does not exist in the database", async () => {
    const mockEmail = "nonexistent.email@example.com";
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await checkUserEmailExistStatus(mockEmail);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      [mockEmail]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockEmail = "error.email@example.com";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(checkUserEmailExistStatus(mockEmail)).rejects.toThrow(
      "Database error"
    );
    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      [mockEmail]
    );
  });
});

describe("User Repository - getUserByEmail", () => {
  it("should return the user object if the email exists in the database", async () => {
    const mockEmail = "existing.email@example.com";
    const mockUser = {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: mockEmail,
      password: "hashedpassword123",
    };

    const mockResult = [[mockUser]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserByEmail(mockEmail);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      [mockEmail]
    );
    expect(result).toEqual(mockUser);
  });

  it("should return undefined if the email does not exist in the database", async () => {
    const mockEmail = "nonexistent.email@example.com";
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserByEmail(mockEmail);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      [mockEmail]
    );
    expect(result).toBeUndefined();
  });

  it("should throw an error if the database query fails", async () => {
    const mockEmail = "error.email@example.com";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(getUserByEmail(mockEmail)).rejects.toThrow("Database error");
    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      [mockEmail]
    );
  });
});

describe("User Repository - getUserById", () => {
  it("should return the user object if the user ID exists in the database", async () => {
    const mockUserId = 1;
    const mockUser = {
      id: mockUserId,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      password: "hashedpassword123",
    };

    const mockResult = [[mockUser]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserById(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE id = ?",
      [mockUserId]
    );
    expect(result).toEqual(mockUser);
  });

  it("should return empty object if the user ID does not exist in the database", async () => {
    const mockUserId = 999;
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserById(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE id = ?",
      [mockUserId]
    );

    expect(result).toEqual({});
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(getUserById(mockUserId)).rejects.toThrow("Database error");
    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE id = ?",
      [mockUserId]
    );
  });
});

describe("User Repository - createUserInitialPainDetails", () => {
  it("should insert initial pain details and return true if successful", async () => {
    const mockPainDetails = {
      user_id: 1,
      type_of_injury: "shoulder",
      injury_occured: "LESS_THAN_2_WEEKS",
      diagnosed_by_medical_professional: true,
      pain_level: 5,
      stiffness: 3,
      swelling: 2,
      has_pain_during_daily_activities: true,
      had_surgery: false,
      surgery_date: null,
      is_get_physiotherapy_before: false,
      is_previous_physiotherapy_completed: false,
      physiothrtapy_description: "None",
    } as any;

    const mockResult = [{ affectedRows: 1 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await createUserInitialPainDetails(mockPainDetails);

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_initial_pain (user_id, type_of_injury, injury_occured, diagnosed_by_medical_professional, pain_level,stiffness,swelling, has_pain_during_daily_activities, had_surgery, surgery_date, is_get_physiotherapy_before,is_previous_physiotherapy_completed, physiothrtapy_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        mockPainDetails.user_id,
        mockPainDetails.type_of_injury,
        mockPainDetails.injury_occured,
        mockPainDetails.diagnosed_by_medical_professional,
        mockPainDetails.pain_level,
        mockPainDetails.stiffness,
        mockPainDetails.swelling,
        mockPainDetails.has_pain_during_daily_activities,
        mockPainDetails.had_surgery,
        mockPainDetails.surgery_date,
        mockPainDetails.is_get_physiotherapy_before,
        mockPainDetails.is_previous_physiotherapy_completed,
        mockPainDetails.physiothrtapy_description,
      ]
    );
    expect(result).toBe(true);
  });

  it("should return false if no rows are affected", async () => {
    const mockPainDetails = {
      user_id: 1,
      type_of_injury: "shoulder",
      injury_occured: "LESS_THAN_2_WEEKS",
      diagnosed_by_medical_professional: true,
      pain_level: 5,
      stiffness: 3,
      swelling: 2,
      has_pain_during_daily_activities: true,
      had_surgery: false,
      surgery_date: null,
      is_get_physiotherapy_before: false,
      is_previous_physiotherapy_completed: false,
      physiothrtapy_description: "None",
    } as any;

    const mockResult = [{ affectedRows: 0 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await createUserInitialPainDetails(mockPainDetails);

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_initial_pain (user_id, type_of_injury, injury_occured, diagnosed_by_medical_professional, pain_level,stiffness,swelling, has_pain_during_daily_activities, had_surgery, surgery_date, is_get_physiotherapy_before,is_previous_physiotherapy_completed, physiothrtapy_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        mockPainDetails.user_id,
        mockPainDetails.type_of_injury,
        mockPainDetails.injury_occured,
        mockPainDetails.diagnosed_by_medical_professional,
        mockPainDetails.pain_level,
        mockPainDetails.stiffness,
        mockPainDetails.swelling,
        mockPainDetails.has_pain_during_daily_activities,
        mockPainDetails.had_surgery,
        mockPainDetails.surgery_date,
        mockPainDetails.is_get_physiotherapy_before,
        mockPainDetails.is_previous_physiotherapy_completed,
        mockPainDetails.physiothrtapy_description,
      ]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockPainDetails = {
      user_id: 1,
      type_of_injury: "shoulder",
      injury_occured: "LESS_THAN_2_WEEKS",
      diagnosed_by_medical_professional: true,
      pain_level: 5,
      stiffness: 3,
      swelling: 2,
      has_pain_during_daily_activities: true,
      had_surgery: false,
      surgery_date: null,
      is_get_physiotherapy_before: false,
      is_previous_physiotherapy_completed: false,
      physiothrtapy_description: "None",
    } as any;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(createUserInitialPainDetails(mockPainDetails)).rejects.toThrow(
      "Database error"
    );
    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_initial_pain (user_id, type_of_injury, injury_occured, diagnosed_by_medical_professional, pain_level,stiffness,swelling, has_pain_during_daily_activities, had_surgery, surgery_date, is_get_physiotherapy_before,is_previous_physiotherapy_completed, physiothrtapy_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        mockPainDetails.user_id,
        mockPainDetails.type_of_injury,
        mockPainDetails.injury_occured,
        mockPainDetails.diagnosed_by_medical_professional,
        mockPainDetails.pain_level,
        mockPainDetails.stiffness,
        mockPainDetails.swelling,
        mockPainDetails.has_pain_during_daily_activities,
        mockPainDetails.had_surgery,
        mockPainDetails.surgery_date,
        mockPainDetails.is_get_physiotherapy_before,
        mockPainDetails.is_previous_physiotherapy_completed,
        mockPainDetails.physiothrtapy_description,
      ]
    );
  });
});

describe("User Repository - getUserProfileDetails", () => {
  it("should return the user profile details if the user ID exists in the database", async () => {
    const mockUserId = 1;
    const mockUserProfile = {
      id: mockUserId,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      is_email_verified: true,
      level: 2,
    };

    const mockResult = [[mockUserProfile]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserProfileDetails(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT id,first_name,last_name,email,is_email_verified,level FROM users WHERE id = ?",
      [mockUserId]
    );
    expect(result).toEqual(mockUserProfile);
  });

  it("should return an empty object if the user ID does not exist in the database", async () => {
    const mockUserId = 999;
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserProfileDetails(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT id,first_name,last_name,email,is_email_verified,level FROM users WHERE id = ?",
      [mockUserId]
    );
    expect(result).toEqual({});
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(getUserProfileDetails(mockUserId)).rejects.toThrow(
      "Database error"
    );
    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT id,first_name,last_name,email,is_email_verified,level FROM users WHERE id = ?",
      [mockUserId]
    );
  });
});

describe("User Repository - getInitialPainDetails", () => {
  it("should return the initial pain details if the user ID exists in the database", async () => {
    const mockUserId = 1;
    const mockPainDetails = {
      user_id: mockUserId,
      type_of_injury: "shoulder",
      injury_occured: "LESS_THAN_2_WEEKS",
      diagnosed_by_medical_professional: true,
      pain_level: 5,
      stiffness: 3,
      swelling: 2,
      has_pain_during_daily_activities: true,
      had_surgery: false,
      surgery_date: null,
      is_get_physiotherapy_before: false,
      is_previous_physiotherapy_completed: false,
      physiothrtapy_description: "None",
    };

    const mockResult = [[mockPainDetails]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getInitialPainDetails(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_initial_pain WHERE user_id = ?",
      [mockUserId]
    );
    expect(result).toEqual(mockPainDetails);
  });

  it("should return empty list if the user ID does not exist in the database", async () => {
    const mockUserId = 999;
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getInitialPainDetails(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_initial_pain WHERE user_id = ?",
      [mockUserId]
    );
    expect(result).toBeUndefined();
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(getInitialPainDetails(mockUserId)).rejects.toThrow(
      "Database error"
    );
    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_initial_pain WHERE user_id = ?",
      [mockUserId]
    );
  });
});

describe("User Repository - updateUserLevel", () => {
  it("should update the user's level and return true if successful", async () => {
    const mockUserId = 1;
    const mockLevel = 3;
    const mockResult = [{ affectedRows: 1 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserLevel(mockUserId, mockLevel);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET level = ? WHERE id = ?",
      [mockLevel, mockUserId]
    );
    expect(result).toBe(true);
  });

  it("should return false if no rows are affected", async () => {
    const mockUserId = 1;
    const mockLevel = 3;
    const mockResult = [{ affectedRows: 0 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserLevel(mockUserId, mockLevel);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET level = ? WHERE id = ?",
      [mockLevel, mockUserId]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;
    const mockLevel = 3;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(updateUserLevel(mockUserId, mockLevel)).rejects.toThrow(
      "Database error"
    );
    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET level = ? WHERE id = ?",
      [mockLevel, mockUserId]
    );
  });
});

describe("User Repository - createUserFeedback", () => {
  it("should insert user feedback and return true if successful", async () => {
    const mockFeedbackDetails = {
      user_id: 1,
      pain_level: 5,
      swelling: 3,
      stiffness: 2,
      fatigue_level: 4,
      strength_perception: 3,
      functional_improvement: 2,
      exercise_tolerance: 4,
    };

    const mockResult = [{ affectedRows: 1 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await createUserFeedback(mockFeedbackDetails);

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_feedbacks (user_id,pain_level,swelling,stiffness,fatigue_level,strength_perception,functional_improvement,exercise_tolerance) VALUES (?,?,?,?,?,?,?,?)",
      [
        mockFeedbackDetails.user_id,
        mockFeedbackDetails.pain_level,
        mockFeedbackDetails.swelling,
        mockFeedbackDetails.stiffness,
        mockFeedbackDetails.fatigue_level,
        mockFeedbackDetails.strength_perception,
        mockFeedbackDetails.functional_improvement,
        mockFeedbackDetails.exercise_tolerance,
      ]
    );
    expect(result).toBe(true);
  });

  it("should return false if no rows are affected", async () => {
    const mockFeedbackDetails = {
      user_id: 1,
      pain_level: 5,
      swelling: 3,
      stiffness: 2,
      fatigue_level: 4,
      strength_perception: 3,
      functional_improvement: 2,
      exercise_tolerance: 4,
    };

    const mockResult = [{ affectedRows: 0 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await createUserFeedback(mockFeedbackDetails);

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_feedbacks (user_id,pain_level,swelling,stiffness,fatigue_level,strength_perception,functional_improvement,exercise_tolerance) VALUES (?,?,?,?,?,?,?,?)",
      [
        mockFeedbackDetails.user_id,
        mockFeedbackDetails.pain_level,
        mockFeedbackDetails.swelling,
        mockFeedbackDetails.stiffness,
        mockFeedbackDetails.fatigue_level,
        mockFeedbackDetails.strength_perception,
        mockFeedbackDetails.functional_improvement,
        mockFeedbackDetails.exercise_tolerance,
      ]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockFeedbackDetails = {
      user_id: 1,
      pain_level: 5,
      swelling: 3,
      stiffness: 2,
      fatigue_level: 4,
      strength_perception: 3,
      functional_improvement: 2,
      exercise_tolerance: 4,
    };

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(createUserFeedback(mockFeedbackDetails)).rejects.toThrow(
      "Database error"
    );
    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_feedbacks (user_id,pain_level,swelling,stiffness,fatigue_level,strength_perception,functional_improvement,exercise_tolerance) VALUES (?,?,?,?,?,?,?,?)",
      [
        mockFeedbackDetails.user_id,
        mockFeedbackDetails.pain_level,
        mockFeedbackDetails.swelling,
        mockFeedbackDetails.stiffness,
        mockFeedbackDetails.fatigue_level,
        mockFeedbackDetails.strength_perception,
        mockFeedbackDetails.functional_improvement,
        mockFeedbackDetails.exercise_tolerance,
      ]
    );
  });
});

describe("User Repository - saveEmailVerificationToken", () => {
  it("should save the email verification token successfully", async () => {
    const mockUserId = 1;
    const mockToken = "test-token";

    const mockResult = [{ affectedRows: 1 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    await saveEmailVerificationToken(mockUserId, mockToken);

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [mockUserId, mockToken, expect.any(Date)]
    );
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;
    const mockToken = "test-token";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(
      saveEmailVerificationToken(mockUserId, mockToken)
    ).rejects.toThrow("Database error");

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [mockUserId, mockToken, expect.any(Date)]
    );
  });
});

describe("User Repository - saveForgotPasswordOtp", () => {
  it("should save the forgot password OTP successfully", async () => {
    const mockUserId = 1;
    const mockOtp = "123456";

    const mockResult = [{ affectedRows: 1 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    await saveForgotPasswordOtp(mockUserId, mockOtp);

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_forgot_password_otps (user_id, otp, expires_at) VALUES (?, ?, ?)",
      [mockUserId, mockOtp, expect.any(Date)]
    );
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;
    const mockOtp = "123456";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(saveForgotPasswordOtp(mockUserId, mockOtp)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_forgot_password_otps (user_id, otp, expires_at) VALUES (?, ?, ?)",
      [mockUserId, mockOtp, expect.any(Date)]
    );
  });
});

describe("User Repository - getEmailVerificationToken", () => {
  it("should return the token details if the token exists and is not expired", async () => {
    const mockToken = "valid-token";
    const mockTokenDetails = {
      id: 1,
      user_id: 1,
      token: mockToken,
      expires_at: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    };

    const mockResult = [[mockTokenDetails]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getEmailVerificationToken(mockToken);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_email_verification_tokens WHERE token = ? AND expires_at > ?",
      [mockToken, expect.any(Date)]
    );
    expect(result).toEqual(mockTokenDetails);
  });

  it("should return undefined if the token does not exist or is expired", async () => {
    const mockToken = "expired-or-nonexistent-token";
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getEmailVerificationToken(mockToken);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_email_verification_tokens WHERE token = ? AND expires_at > ?",
      [mockToken, expect.any(Date)]
    );
    expect(result).toBeUndefined();
  });

  it("should throw an error if the database query fails", async () => {
    const mockToken = "error-token";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(getEmailVerificationToken(mockToken)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_email_verification_tokens WHERE token = ? AND expires_at > ?",
      [mockToken, expect.any(Date)]
    );
  });
});

describe("User Repository - deleteEmailVerificationToken", () => {
  it("should delete the email verification token successfully", async () => {
    const mockToken = "test-token";

    const mockResult = [{ affectedRows: 1 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    await deleteEmailVerificationToken(mockToken);

    expect(pool.execute).toHaveBeenCalledWith(
      "DELETE FROM users_email_verification_tokens WHERE token = ?",
      [mockToken]
    );
  });

  it("should throw an error if the database query fails", async () => {
    const mockToken = "test-token";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(deleteEmailVerificationToken(mockToken)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "DELETE FROM users_email_verification_tokens WHERE token = ?",
      [mockToken]
    );
  });
});

describe("User Repository - updateEmailVerificationStatus", () => {
  it("should update the email verification status successfully", async () => {
    const mockUserId = 1;

    const mockResult = [{ affectedRows: 1 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    await updateEmailVerificationStatus(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET is_email_verified = ? WHERE id = ?",
      [true, mockUserId]
    );
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(updateEmailVerificationStatus(mockUserId)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET is_email_verified = ? WHERE id = ?",
      [true, mockUserId]
    );
  });
});

describe("User Repository - getUserExerciseReportByDate", () => {
  it("should return the exercise report grouped by date for the last 14 days", async () => {
    const mockUserId = 1;
    const mockReport = [
      { date: "2023-10-01", count: 2 },
      { date: "2023-10-02", count: 3 },
    ];

    const mockResult = [mockReport];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserExerciseReportByDate(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, COUNT(*) AS count FROM users_feedbacks WHERE user_id=? AND date>=NOW() - INTERVAL 14 DAY GROUP BY DATE_FORMAT(date, '%Y-%m-%d') ORDER BY date ASC",
      [mockUserId]
    );
    expect(result).toEqual(mockReport);
  });

  it("should return an empty array if no data exists for the user in the last 14 days", async () => {
    const mockUserId = 1;
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserExerciseReportByDate(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, COUNT(*) AS count FROM users_feedbacks WHERE user_id=? AND date>=NOW() - INTERVAL 14 DAY GROUP BY DATE_FORMAT(date, '%Y-%m-%d') ORDER BY date ASC",
      [mockUserId]
    );
    expect(result).toEqual([]);
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(getUserExerciseReportByDate(mockUserId)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, COUNT(*) AS count FROM users_feedbacks WHERE user_id=? AND date>=NOW() - INTERVAL 14 DAY GROUP BY DATE_FORMAT(date, '%Y-%m-%d') ORDER BY date ASC",
      [mockUserId]
    );
  });
});

describe("User Repository - updateUserFirstName", () => {
  it("should update the user's first name and return true if successful", async () => {
    const mockUserId = 1;
    const mockFirstName = "UpdatedName";
    const mockResult = [{ affectedRows: 1 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserFirstName(mockUserId, mockFirstName);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET first_name = ? WHERE id = ?",
      [mockFirstName, mockUserId]
    );
    expect(result).toBe(true);
  });

  it("should return false if no rows are affected", async () => {
    const mockUserId = 1;
    const mockFirstName = "UpdatedName";
    const mockResult = [{ affectedRows: 0 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserFirstName(mockUserId, mockFirstName);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET first_name = ? WHERE id = ?",
      [mockFirstName, mockUserId]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;
    const mockFirstName = "UpdatedName";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(
      updateUserFirstName(mockUserId, mockFirstName)
    ).rejects.toThrow("Database error");

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET first_name = ? WHERE id = ?",
      [mockFirstName, mockUserId]
    );
  });
});

describe("User Repository - updateUserLastName", () => {
  it("should update the user's last name and return true if successful", async () => {
    const mockUserId = 1;
    const mockLastName = "UpdatedLastName";
    const mockResult = [{ affectedRows: 1 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserLastName(mockUserId, mockLastName);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET last_name = ? WHERE id = ?",
      [mockLastName, mockUserId]
    );
    expect(result).toBe(true);
  });

  it("should return false if no rows are affected", async () => {
    const mockUserId = 1;
    const mockLastName = "UpdatedLastName";
    const mockResult = [{ affectedRows: 0 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserLastName(mockUserId, mockLastName);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET last_name = ? WHERE id = ?",
      [mockLastName, mockUserId]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;
    const mockLastName = "UpdatedLastName";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(updateUserLastName(mockUserId, mockLastName)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET last_name = ? WHERE id = ?",
      [mockLastName, mockUserId]
    );
  });
});

describe("User Repository - updateUserEmail", () => {
  it("should update the user's email and set is_email_verified to false, returning true if successful", async () => {
    const mockUserId = 1;
    const mockEmail = "updated.email@example.com";
    const mockResult = [{ affectedRows: 1 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserEmail(mockUserId, mockEmail);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET email = ?, is_email_verified = ? WHERE id = ?",
      [mockEmail, false, mockUserId]
    );
    expect(result).toBe(true);
  });

  it("should return false if no rows are affected", async () => {
    const mockUserId = 1;
    const mockEmail = "updated.email@example.com";
    const mockResult = [{ affectedRows: 0 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserEmail(mockUserId, mockEmail);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET email = ?, is_email_verified = ? WHERE id = ?",
      [mockEmail, false, mockUserId]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;
    const mockEmail = "updated.email@example.com";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(updateUserEmail(mockUserId, mockEmail)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET email = ?, is_email_verified = ? WHERE id = ?",
      [mockEmail, false, mockUserId]
    );
  });
});

describe("User Repository - updateUserPassword", () => {
  it("should update the user's password and return true if successful", async () => {
    const mockUserId = 1;
    const mockPassword = "newPassword123";
    const mockResult = [{ affectedRows: 1 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserPassword(mockUserId, mockPassword);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET password = ? WHERE id = ?",
      [mockPassword, mockUserId]
    );
    expect(result).toBe(true);
  });

  it("should return false if no rows are affected", async () => {
    const mockUserId = 1;
    const mockPassword = "newPassword123";
    const mockResult = [{ affectedRows: 0 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await updateUserPassword(mockUserId, mockPassword);

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET password = ? WHERE id = ?",
      [mockPassword, mockUserId]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;
    const mockPassword = "newPassword123";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(updateUserPassword(mockUserId, mockPassword)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "UPDATE users SET password = ? WHERE id = ?",
      [mockPassword, mockUserId]
    );
  });
});

describe("User Repository - getForgotPasswordOtp", () => {
  it("should return the OTP details if the OTP exists and is not expired", async () => {
    const mockOtp = "123456";
    const mockOtpDetails = {
      id: 1,
      user_id: 1,
      otp: mockOtp,
      expires_at: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes from now
    };

    const mockResult = [[mockOtpDetails]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getForgotPasswordOtp(mockOtp);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_forgot_password_otps WHERE otp = ? AND expires_at > ?",
      [mockOtp, expect.any(Date)]
    );
    expect(result).toEqual(mockOtpDetails);
  });

  it("should return undefined if the OTP does not exist or is expired", async () => {
    const mockOtp = "expired-or-nonexistent-otp";
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getForgotPasswordOtp(mockOtp);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_forgot_password_otps WHERE otp = ? AND expires_at > ?",
      [mockOtp, expect.any(Date)]
    );
    expect(result).toBeUndefined();
  });

  it("should throw an error if the database query fails", async () => {
    const mockOtp = "error-otp";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(getForgotPasswordOtp(mockOtp)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_forgot_password_otps WHERE otp = ? AND expires_at > ?",
      [mockOtp, expect.any(Date)]
    );
  });
});

describe("User Repository - deleteForgotPasswordOtp", () => {
  it("should delete the forgot password OTP successfully", async () => {
    const mockOtp = "123456";

    const mockResult = [{ affectedRows: 1 }];
    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    await deleteForgotPasswordOtp(mockOtp);

    expect(pool.execute).toHaveBeenCalledWith(
      "DELETE FROM users_forgot_password_otps WHERE otp = ?",
      [mockOtp]
    );
  });

  it("should throw an error if the database query fails", async () => {
    const mockOtp = "123456";

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(deleteForgotPasswordOtp(mockOtp)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "DELETE FROM users_forgot_password_otps WHERE otp = ?",
      [mockOtp]
    );
  });
});

describe("User Repository - checkUserExistStatus", () => {
  it("should return true if the user ID exists in the database", async () => {
    const mockUserId = 1;
    const mockResult = [[{ id: mockUserId }]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await checkUserExistStatus(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE id = ?",
      [mockUserId]
    );
    expect(result).toBe(true);
  });

  it("should return false if the user ID does not exist in the database", async () => {
    const mockUserId = 999;
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await checkUserExistStatus(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE id = ?",
      [mockUserId]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(checkUserExistStatus(mockUserId)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE id = ?",
      [mockUserId]
    );
  });
});

describe("User Repository - createUserScore", () => {
  it("should insert a user score and return true if successful", async () => {
    const mockUserId = 1;
    const mockScore = 85;
    const mockResult = [{ affectedRows: 1 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await createUserScore(mockUserId, mockScore);

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_scores (user_id,score) VALUES (?,?)",
      [mockUserId, mockScore]
    );
    expect(result).toBe(true);
  });

  it("should return false if no rows are affected", async () => {
    const mockUserId = 1;
    const mockScore = 85;
    const mockResult = [{ affectedRows: 0 }];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await createUserScore(mockUserId, mockScore);

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_scores (user_id,score) VALUES (?,?)",
      [mockUserId, mockScore]
    );
    expect(result).toBe(false);
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;
    const mockScore = 85;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(createUserScore(mockUserId, mockScore)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "INSERT INTO users_scores (user_id,score) VALUES (?,?)",
      [mockUserId, mockScore]
    );
  });
});

describe("User Repository - getUserLatestScore", () => {
  it("should return the latest score for the given user ID", async () => {
    const mockUserId = 1;
    const mockLatestScore = {
      id: 10,
      user_id: mockUserId,
      score: 95,
    };

    const mockResult = [[mockLatestScore]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserLatestScore(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_scores WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [mockUserId]
    );
    expect(result).toEqual(mockLatestScore);
  });

  it("should return undefined if the user has no scores", async () => {
    const mockUserId = 1;
    const mockResult = [[]];

    (pool.execute as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await getUserLatestScore(mockUserId);

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_scores WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [mockUserId]
    );
    expect(result).toBeUndefined();
  });

  it("should throw an error if the database query fails", async () => {
    const mockUserId = 1;

    (pool.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await expect(getUserLatestScore(mockUserId)).rejects.toThrow(
      "Database error"
    );

    expect(pool.execute).toHaveBeenCalledWith(
      "SELECT * FROM users_scores WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [mockUserId]
    );
  });
});
