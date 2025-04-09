import { UserPainLevelDetails } from "../models/userPainLevelDetailsModel";

export const calculateUserPainLevel = ({
  pain_level,
  swelling,
  stiffness,
  fatigue_level,
}: UserPainLevelDetails): number => {
  const values = [pain_level, swelling, stiffness, fatigue_level];
  let hasHighValues = false;
  let allWithinMidRange = true;
  let allBelowThreshold = true;
  for (const value of values) {
    if (value >= 7) {
      hasHighValues = true;
    }

    if (value < 3 || value > 6) {
      allWithinMidRange = false;
    }

    if (value >= 4) {
      allBelowThreshold = false;
    }
  }

  if (hasHighValues) {
    return -1;
  } else if (allWithinMidRange) {
    return 0;
  } else if (allBelowThreshold) {
    return 1;
  }
  return 0;
};
