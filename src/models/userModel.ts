import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}
