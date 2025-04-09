import { randomBytes } from "crypto";

export const generateUniqueToken = (length: number = 32): string => {
  return randomBytes(length).toString("hex");
};
