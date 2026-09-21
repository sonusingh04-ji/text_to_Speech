import express from "express";

import {
    createFavorite,
    getMyFavorites,
    deleteFavorite,
    checkFavorite
} from "../controllers/favoriteController.js";

import {
    requireAuth
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    requireAuth,
    getMyFavorites
);

router.post(
    "/:historyId",
    requireAuth,
    createFavorite
);

router.delete(
    "/:historyId",
    requireAuth,
    deleteFavorite
);

router.get(
    "/:historyId/check",
    requireAuth,
    checkFavorite
);

export default router;