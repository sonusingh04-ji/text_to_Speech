import express from "express";

import {
    getUsage
} from "../controllers/usageController.js";

import {
    requireAuth
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    requireAuth,
    getUsage
);

export default router;