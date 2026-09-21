import express from "express";

import {
    getMyHistory,
    getHistoryItem,
    deleteHistoryItem
} from "../controllers/historyController.js";

import {
    requireAuth
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    requireAuth,
    getMyHistory
);

router.get(
    "/:id",
    requireAuth,
    getHistoryItem
);

router.delete(
    "/:id",
    requireAuth,
    deleteHistoryItem
);

export default router;