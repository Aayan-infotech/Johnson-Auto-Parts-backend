"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../admin/adminAuth");
const adminMiddleware_1 = require("../admin/adminMiddleware");
const router = (0, express_1.Router)();
router.post("/login", adminAuth_1.login);
router.post("/changeAdminPass", adminMiddleware_1.verifyAdminToken, adminAuth_1.changeAdminPass);
exports.default = router;
