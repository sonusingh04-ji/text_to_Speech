import express from "express";

import {
    getVoices,
    getLanguages,
    createSpeech
} from "../controllers/ttsController.js";

import {
    validateTtsRequest
} from "../middleware/validateTtsRequest.js";

import {
    requireAuth
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/voices",
    getVoices
);

router.get(
    "/languages",
    getLanguages
);

router.post(
    "/tts",
    requireAuth,
    validateTtsRequest,
    createSpeech
);

export default router;