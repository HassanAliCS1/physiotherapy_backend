import { UserCalculatedScoreAndLevel } from "../models/UserCalculatedScoreModel";
import { UserFeedback } from "../models/userFeedbackModel";
import { CreateUserInitialPainDetails } from "../models/userInitialPainModel";

export const calculateUserInitialLevel = (
  details: CreateUserInitialPainDetails
): UserCalculatedScoreAndLevel => {
  const {
    injury_occured,
    diagnosed_by_medical_professional,
    pain_level,
    stiffness,
    swelling,
    has_pain_during_daily_activities,
    had_surgery,
    surgery_date,
    is_get_physiotherapy_before,
    is_previous_physiotherapy_completed,
  } = details;

  // Calculate score for Levels 1-10
  let score = 0;

  // Check for Level 0 conditions
  if (pain_level >= 7 || swelling >= 7 || stiffness >= 7) {
    return { level: 0, score };
  }

  // Calculate time since injury based on injury_occured ENUM
  let timeSinceInjuryDays;
  switch (injury_occured) {
    case "LESS_THAN_2_WEEKS":
      timeSinceInjuryDays = 7;
      break;
    case "TWO_WEEKS_TO_1_MONTH":
      timeSinceInjuryDays = 30;
      break;
    case "ONE_TO_3_MONTHS":
      timeSinceInjuryDays = 90;
      break;
    case "THREE_TO_6_MONTHS":
      timeSinceInjuryDays = 180;
      break;
    case "SIX_PLUS_MONTHS":
      timeSinceInjuryDays = 365;
      break;
    default:
      timeSinceInjuryDays = 0; // Default to 0 if unknown
  }

  if (timeSinceInjuryDays <= 30) {
    return { level: 0, score };
  }

  // Check for recent surgery
  let timeSinceSurgeryDays;
  if (had_surgery && surgery_date) {
    const surgeryDate = new Date(surgery_date).valueOf();
    const currentDate = new Date().valueOf();
    timeSinceSurgeryDays = (currentDate - surgeryDate) / (1000 * 60 * 60 * 24); // in days

    if (timeSinceSurgeryDays <= 90) {
      return { level: 0, score };
    }
  }

  // 1. Time Since Injury
  if (timeSinceInjuryDays < 14) {
    score += 1;
  } else if (timeSinceInjuryDays >= 14 && timeSinceInjuryDays <= 30) {
    score += 2;
  } else if (timeSinceInjuryDays > 30 && timeSinceInjuryDays <= 90) {
    score += 3;
  } else if (timeSinceInjuryDays > 90 && timeSinceInjuryDays <= 180) {
    score += 4;
  } else if (timeSinceInjuryDays > 180) {
    score += 5;
  }

  // 2. Diagnosed by a Medical Professional
  if (diagnosed_by_medical_professional) {
    score += 2;
  } else {
    score += 1;
  }

  // 3. Pain Level
  if (pain_level >= 1 && pain_level <= 3) {
    score += 5;
  } else if (pain_level >= 4 && pain_level <= 6) {
    score += 3;
  }

  // 4. Pain During Daily Activities
  if (!has_pain_during_daily_activities) {
    score += 3;
  } else {
    score += 1;
  }

  // 5. Surgery History
  if (!had_surgery) {
    score += 5;
  } else if (
    timeSinceSurgeryDays &&
    timeSinceSurgeryDays > 90 &&
    timeSinceSurgeryDays <= 180
  ) {
    score += 3;
  } else if (timeSinceSurgeryDays && timeSinceSurgeryDays > 180) {
    score += 4;
  }

  // 6. Previous Physiotherapy
  if (is_get_physiotherapy_before) {
    if (is_previous_physiotherapy_completed) {
      score += 5;
    } else {
      score += 3;
    }
  } else {
    score += 2;
  }

  // 7. Swelling Level
  if (swelling >= 1 && swelling <= 3) {
    score += 5;
  } else if (swelling >= 4 && swelling <= 6) {
    score += 3;
  }

  // Map score to rehabilitation level
  if (score <= 10) {
    return { level: 1, score }; //"Low-Level exercise recommended."
  } else if (score >= 11 && score <= 15) {
    return { level: 2, score }; //"Low-Level exercise recommended."
  } else if (score >= 16 && score <= 20) {
    return { level: 3, score }; //"Low-Level exercise recommended."
  } else if (score >= 21 && score <= 25) {
    return { level: 4, score }; //"Mid-Level exercise recommended."
  } else if (score >= 26 && score <= 30) {
    return { level: 5, score }; //"Mid-Level exercise recommended."
  } else if (score >= 31 && score <= 35) {
    return { level: 6, score }; //"Mid-Level exercise recommended."
  } else if (score >= 36 && score <= 40) {
    return { level: 7, score }; //"High-Level exercise recommended." ;
  } else if (score >= 41 && score <= 45) {
    return { level: 8, score }; //"High-Level exercise recommended."
  } else if (score >= 46 && score <= 50) {
    return { level: 9, score }; //"High-Level exercise recommended."
  } else if (score >= 51) {
    return { level: 10, score }; //"High-Level exercise recommended."
  }

  return { level: 0, score };
};

export const calculateUserUpdatedLevel = (
  currentLevel: number,
  previousScore: number,
  feedback: UserFeedback
): UserCalculatedScoreAndLevel => {
  const {
    pain_level,
    stiffness,
    fatigue_level,
    strength_perception,
    functional_improvement,
    exercise_tolerance,
    swelling,
  } = feedback;

  // Calculate the score based on the feedback
  let score = 0;

  // Check for Level 0 conditions
  if (
    pain_level >= 7 ||
    stiffness >= 7 ||
    swelling >= 7 ||
    fatigue_level >= 7
  ) {
    return { level: 0, score: score }; // Assign Level 0 (No Exercise)
  }

  // Pain Level
  if (pain_level >= 1 && pain_level <= 3) {
    score += 5;
  } else if (pain_level >= 4 && pain_level <= 6) {
    score += 3;
  }

  // Stiffness Level
  if (stiffness >= 1 && stiffness <= 3) {
    score += 5;
  } else if (stiffness >= 4 && stiffness <= 6) {
    score += 3;
  }

  // Fatigue Level
  if (fatigue_level >= 1 && fatigue_level <= 3) {
    score += 5;
  } else if (fatigue_level >= 4 && fatigue_level <= 6) {
    score += 3;
  }

  // Strength Perception
  if (strength_perception >= 1 && strength_perception <= 3) {
    score += 1;
  } else if (strength_perception >= 4 && strength_perception <= 6) {
    score += 3;
  } else if (strength_perception >= 7 && strength_perception <= 10) {
    score += 5;
  }

  // Functional Improvement
  if (functional_improvement >= 1 && functional_improvement <= 3) {
    score += 1;
  } else if (functional_improvement >= 4 && functional_improvement <= 6) {
    score += 3;
  } else if (functional_improvement >= 7 && functional_improvement <= 10) {
    score += 5;
  }

  // Exercise Tolerance
  if (exercise_tolerance >= 1 && exercise_tolerance <= 3) {
    score += 1;
  } else if (exercise_tolerance >= 4 && exercise_tolerance <= 6) {
    score += 3;
  } else if (exercise_tolerance >= 7 && exercise_tolerance <= 10) {
    score += 5;
  }

  // Swelling Level
  if (swelling >= 1 && swelling <= 3) {
    score += 5;
  } else if (swelling >= 4 && swelling <= 6) {
    score += 3;
  }

  if (score - previousScore >= 5) {
    return { level: currentLevel + 1, score }; // Increase level by 1
  } else if (previousScore - score >= 5) {
    return { level: currentLevel - 1, score }; // Decrease level by 1
  } else {
    return { level: currentLevel, score }; // Stay at the same level
  }
};
