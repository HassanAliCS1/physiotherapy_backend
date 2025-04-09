import { RowDataPacket } from "mysql2";

export interface UserProfile extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_email_verified: boolean;
  level: number;
}
