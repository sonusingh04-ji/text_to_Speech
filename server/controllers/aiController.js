import {
    enhanceText
} from "../services/aiService.js";


const handleEnhancement = async (
    operation,
    req,
    res,
    next
) => {
    try {
        /*
         * Safely read the request body.
         * This prevents req.body === undefined
         * from causing a 500 error.
         */
        const body = req.body || {};

        const text = body.text;

        if (
            typeof text !== "string" ||
            !text.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Text is required.",
                code: "TEXT_REQUIRED"
            });
        }

        if (text.length > 10000) {
            return res.status(400).json({
                success: false,
                message:
                    "Text exceeds the maximum allowed length of 10000 characters.",
                code: "TEXT_TOO_LONG"
            });
        }

        const result = await enhanceText({
            text: text.trim(),
            operation
        });

        return res.status(200).json({
            success: true,
            operation: result.operation,
            model: result.model,
            originalText: text.trim(),
            enhancedText: result.text
        });

    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Summarize
|--------------------------------------------------------------------------
*/
export const summarize = async (
    req,
    res,
    next
) => {
    return handleEnhancement(
        "summarize",
        req,
        res,
        next
    );
};


/*
|--------------------------------------------------------------------------
| Grammar Correction
|--------------------------------------------------------------------------
*/
export const grammar = async (
    req,
    res,
    next
) => {
    return handleEnhancement(
        "grammar",
        req,
        res,
        next
    );
};


/*
|--------------------------------------------------------------------------
| Rewrite
|--------------------------------------------------------------------------
*/
export const rewrite = async (
    req,
    res,
    next
) => {
    return handleEnhancement(
        "rewrite",
        req,
        res,
        next
    );
};


/*
|--------------------------------------------------------------------------
| Conversational
|--------------------------------------------------------------------------
*/
export const conversational = async (
    req,
    res,
    next
) => {
    return handleEnhancement(
        "conversational",
        req,
        res,
        next
    );
};