import { Request, Response } from "express";

export interface APIRequest extends Request {
  userId?: number;
}

export interface APIResponse extends Response {}
