"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cors_1 = __importDefault(require("cors"));
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3001';
console.log("FE Origin" + allowedOrigin);
const app = (0, express_1.default)();
db_1.default.getConnection().then((connection) => {
    if (connection) {
        console.log("Database connected successfully!");
        connection.release();
    }
    else {
        console.log("Database connection failed");
    }
});
app.use((0, cors_1.default)({
    origin: allowedOrigin,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api", userRoutes_1.default);
exports.default = app;
