import jwt from "jsonwebtoken";

export interface UserTokenDetails {
  user_id: number;
  email: string;
}

export const generateAccessToken = (userId: number, email: string): string => {
  return jwt.sign(
    {
      user_id: userId,
      email: email,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );
};

export const verifyAccessToken = (token: string): UserTokenDetails => {
  return jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!
  ) as UserTokenDetails;
};
