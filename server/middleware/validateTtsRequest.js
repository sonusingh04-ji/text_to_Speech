import {
    languages,
    getConfiguredVoices
} from "../utils/voices.js";


/*
|--------------------------------------------------------------------------
| Maximum TTS Request
|--------------------------------------------------------------------------
|
| ElevenLabs Flash v2.5 supports up to 40,000 characters per request.
|
|--------------------------------------------------------------------------
*/
const MAX_TEXT_LENGTH = 40000;


/*
|--------------------------------------------------------------------------
| Validate TTS Request
|--------------------------------------------------------------------------
*/
export const validateTtsRequest = (
    req,
    res,
    next
) => {

    /*
    |--------------------------------------------------------------------------
    | Content Type
    |--------------------------------------------------------------------------
    */
    if (
        !req.is("application/json")
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Content-Type must be application/json",
            code:
                "INVALID_CONTENT_TYPE"
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Request Body
    |--------------------------------------------------------------------------
    */
    const body =
        req.body || {};


    const {
        text,
        language,
        voice,
        speed,
        stability,
        similarityBoost,
        style,
        useSpeakerBoost,
        download
    } = body;


    /*
    |--------------------------------------------------------------------------
    | Text Required
    |--------------------------------------------------------------------------
    */
    if (
        typeof text !== "string" ||
        text.trim().length === 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Text is required and cannot be empty.",
            code:
                "TEXT_REQUIRED"
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Maximum Text Length
    |--------------------------------------------------------------------------
    */
    if (
        text.length >
        MAX_TEXT_LENGTH
    ) {
        return res.status(400).json({
            success: false,
            message:
                `Text cannot exceed ${MAX_TEXT_LENGTH.toLocaleString()} characters.`,
            code:
                "TEXT_TOO_LONG",
            details: {
                maxCharacters:
                MAX_TEXT_LENGTH,
                receivedCharacters:
                text.length
            }
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Language Required
    |--------------------------------------------------------------------------
    */
    if (
        typeof language !== "string" ||
        language.trim().length === 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Language is required.",
            code:
                "LANGUAGE_REQUIRED"
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Supported Language
    |--------------------------------------------------------------------------
    */
    const languageExists =
        languages.some(
            (item) =>
                item.code === language
        );


    if (!languageExists) {
        return res.status(400).json({
            success: false,
            message:
                `Unsupported language: ${language}`,
            code:
                "UNSUPPORTED_LANGUAGE"
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Voice Required
    |--------------------------------------------------------------------------
    */
    if (
        typeof voice !== "string" ||
        voice.trim().length === 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Voice is required.",
            code:
                "VOICE_REQUIRED"
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Voice Validation
    |--------------------------------------------------------------------------
    */
    const configuredVoices =
        getConfiguredVoices();


    if (
        configuredVoices.length > 0
    ) {
        const voiceExists =
            configuredVoices.some(
                (item) =>
                    item.id === voice
            );


        if (!voiceExists) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid or unconfigured ElevenLabs voice ID.",
                code:
                    "INVALID_VOICE"
            });
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Speed
    |--------------------------------------------------------------------------
    */
    if (
        speed !== undefined
    ) {
        if (
            typeof speed !== "number" ||
            speed < 0.7 ||
            speed > 1.2
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Speed must be between 0.7 and 1.2.",
                code:
                    "INVALID_SPEED"
            });
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Stability
    |--------------------------------------------------------------------------
    */
    if (
        stability !== undefined
    ) {
        if (
            typeof stability !== "number" ||
            stability < 0 ||
            stability > 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Stability must be between 0 and 1.",
                code:
                    "INVALID_STABILITY"
            });
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Similarity Boost
    |--------------------------------------------------------------------------
    */
    if (
        similarityBoost !== undefined
    ) {
        if (
            typeof similarityBoost !== "number" ||
            similarityBoost < 0 ||
            similarityBoost > 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "similarityBoost must be between 0 and 1.",
                code:
                    "INVALID_SIMILARITY"
            });
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Style
    |--------------------------------------------------------------------------
    */
    if (
        style !== undefined
    ) {
        if (
            typeof style !== "number" ||
            style < 0 ||
            style > 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Style must be between 0 and 1.",
                code:
                    "INVALID_STYLE"
            });
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Speaker Boost
    |--------------------------------------------------------------------------
    */
    if (
        useSpeakerBoost !== undefined &&
        typeof useSpeakerBoost !== "boolean"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "useSpeakerBoost must be true or false.",
            code:
                "INVALID_SPEAKER_BOOST"
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Download
    |--------------------------------------------------------------------------
    */
    if (
        download !== undefined &&
        typeof download !== "boolean"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "download must be true or false.",
            code:
                "INVALID_DOWNLOAD_VALUE"
        });
    }


    next();
};