import { NextFunction } from "express";

import {
  HTTP_MESSAGES,
  HTTP_RESPONSE_MESSAGES,
  HTTP_STATUS,
} from "../constants/httpConstants";
import { APIRequest, APIResponse } from "../types/custom";
import { errorResponse } from "../utils/response";
import { verifyAccessToken } from "../utils/userToken";

export const authenticateToken = async (
  req: APIRequest,
  res: APIResponse,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: HTTP_MESSAGES.UNAUTHORIZED,
        error: HTTP_RESPONSE_MESSAGES.ACCESS_TOKEN_REQUIRED,
      })
    );
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.user_id;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      errorResponse({
        status: HTTP_STATUS.FORBIDDEN,
        message: HTTP_MESSAGES.FORBIDDEN,
        error: HTTP_RESPONSE_MESSAGES.INVALID_OR_EXPIRED_ACCESS_TOKEN,
      })
    );
  }
};
