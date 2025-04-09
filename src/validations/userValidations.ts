import Joi from "joi";

export const createUserSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
});

export const signInUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const userInitialPainSchema = Joi.object({
  type_of_injury: Joi.string().valid("shoulder", "knee").required(),
  injury_occured: Joi.string()
    .valid(
      "LESS_THAN_2_WEEKS",
      "TWO_WEEKS_TO_1_MONTH",
      "ONE_TO_3_MONTHS",
      "THREE_TO_6_MONTHS",
      "SIX_PLUS_MONTHS"
    )
    .required(),
  diagnosed_by_medical_professional: Joi.boolean().required(),
  pain_level: Joi.number().min(1).max(10).required(),
  stiffness: Joi.number().min(1).max(10).required(),
  swelling: Joi.number().min(1).max(10).required(),
  has_pain_during_daily_activities: Joi.boolean().required(),
  had_surgery: Joi.boolean().required(),
  surgery_date: Joi.date()
    .when("had_surgery", {
      is: true,
      then: Joi.required(),
    })
    .allow(null),
  is_get_physiotherapy_before: Joi.boolean().required(),
  is_previous_physiotherapy_completed: Joi.boolean().when(
    "is_get_physiotherapy_before",
    {
      is: true,
      then: Joi.required(),
    }
  ),
  physiothrtapy_description: Joi.string()
    .when("is_get_physiotherapy_before", {
      is: true,
      then: Joi.required(),
    })
    .allow(null),
});

export const userFeedbackSchema = Joi.object({
  pain_level: Joi.number().min(1).max(10).required(),
  swelling: Joi.number().min(1).max(10).required(),
  stiffness: Joi.number().min(1).max(10).required(),
  fatigue_level: Joi.number().min(1).max(10).required(),
  strength_perception: Joi.number().min(1).max(10).required(),
  functional_improvement: Joi.number().min(1).max(10).required(),
  exercise_tolerance: Joi.number().min(1).max(10).required(),
});

export const updateUserDetailsSchema = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  email: Joi.string().email(),
  old_password: Joi.string().required(),
  new_password: Joi.string().min(8),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  new_password: Joi.string().required(),
  otp: Joi.string().length(4).required(),
});

export const verifyResetPasswordOtpSchema = Joi.object({
  otp: Joi.string().length(4).required(),
});
