import express from "express";

import {
    translate
} from "../controllers/translationController.js";

import {
    requireAuth
} from "../middleware/authMiddleware.js";

const router =
    express.Router();

router.post(
    "/",
    requireAuth,
    translate
);

export default router;