import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  typeCast: (field, next) => {
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1";
    }
    return next();
  },
});

const promisePool = pool.promise();

// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error("Database connection failed:", err.message);
//   } else {
//     console.log("Database connected successfully!");
//     connection.release();
//   }
// });

export default promisePool;
