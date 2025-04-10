"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mysql2_1 = __importDefault(require("mysql2"));
dotenv_1.default.config();
const pool = mysql2_1.default.createPool({
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
exports.default = promisePool;
