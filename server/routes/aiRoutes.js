import express from "express";

import {
    summarize,
    grammar,
    rewrite,
    conversational
} from "../controllers/aiController.js";

import {
    requireAuth
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/summarize",
    requireAuth,
    summarize
);

router.post(
    "/grammar",
    requireAuth,
    grammar
);

router.post(
    "/rewrite",
    requireAuth,
    rewrite
);

router.post(
    "/conversational",
    requireAuth,
    conversational
);

export default router;