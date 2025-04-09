import { RowDataPacket } from "mysql2";

export interface UserScore extends RowDataPacket {
  user_id: number;
  score: number;
  date: Date;
}
