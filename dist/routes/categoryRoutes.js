"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryController_1 = require("../controllers/CategoryController");
const router = (0, express_1.Router)();
router.post('/inssert', CategoryController_1.insertCategory);
exports.default = router;
