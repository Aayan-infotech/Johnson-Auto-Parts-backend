"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminAuthRoutes_1 = __importDefault(require("./adminAuthRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const categoryRoutes_1 = __importDefault(require("./categoryRoutes"));
const router = express_1.default.Router();
router.use("/api/admin", adminAuthRoutes_1.default);
router.use("/api/users", userRoutes_1.default);
router.use("/api/category", categoryRoutes_1.default);
exports.default = router;
