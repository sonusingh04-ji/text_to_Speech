import {
    generateFallbackSpeech
} from "./fallbackTtsService.js";


const ELEVENLABS_BASE_URL =
    "https://api.elevenlabs.io/v1";


/*
|--------------------------------------------------------------------------
| Clamp numeric values
|--------------------------------------------------------------------------
*/
const clamp = (
    value,
    min,
    max,
    fallback
) => {

    if (
        value === undefined ||
        value === null
    ) {

        return fallback;
    }


    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return fallback;
    }


    return Math.min(
        Math.max(
            number,
            min
        ),
        max
    );
};


/*
|--------------------------------------------------------------------------
| Create TTS error
|--------------------------------------------------------------------------
*/
const createTtsError = (
    message,
    statusCode,
    code
) => {

    const error =
        new Error(
            message
        );


    error.statusCode =
        statusCode;


    error.code =
        code;


    return error;
};


/*
|--------------------------------------------------------------------------
| Get ElevenLabs subscription
|--------------------------------------------------------------------------
*/
const getProviderSubscription =
    async (
        apiKey
    ) => {

        try {

            const response =
                await fetch(
                    `${ELEVENLABS_BASE_URL}/user/subscription`,
                    {
                        method:
                            "GET",

                        headers: {
                            "xi-api-key":
                            apiKey,

                            Accept:
                                "application/json"
                        }
                    }
                );


            if (
                !response.ok
            ) {

                return null;
            }


            const data =
                await response.json();


            const characterCount =
                Number(
                    data?.character_count
                );


            const characterLimit =
                Number(
                    data?.character_limit
                );


            if (
                !Number.isFinite(
                    characterCount
                ) ||
                !Number.isFinite(
                    characterLimit
                )
            ) {

                return null;
            }


            return {

                characterCount,

                characterLimit,

                charactersRemaining:
                    Math.max(
                        characterLimit -
                        characterCount,
                        0
                    ),

                tier:
                    data?.tier ||
                    null,

                status:
                    data?.status ||
                    null,

                nextReset:
                    data?.next_character_count_reset_unix ||
                    null

            };

        } catch {

            return null;
        }
    };


/*
|--------------------------------------------------------------------------
| Generate Speech
|--------------------------------------------------------------------------
*/
export const generateSpeech =
    async ({
               text,
               language,
               voice,
               speed = 1,
               stability = 0.5,
               similarityBoost = 0.75,
               style = 0,
               useSpeakerBoost = true
           }) => {

        const apiKey =
            process.env.ELEVENLABS_API_KEY;


        /*
        |--------------------------------------------------------------------------
        | Current ElevenLabs model
        |--------------------------------------------------------------------------
        */
        const modelId =
            process.env.ELEVENLABS_MODEL_ID ||
            process.env.ELEVENLABS_MODEL_ID ||
            "eleven_flash_v2_5";


        /*
        |--------------------------------------------------------------------------
        | Voice
        |--------------------------------------------------------------------------
        */
        const configuredVoice =
            process.env.ELEVENLABS_VOICE_ID ||
            voice;


        /*
        |--------------------------------------------------------------------------
        | Output
        |--------------------------------------------------------------------------
        */
        const outputFormat =
            process.env.ELEVENLABS_OUTPUT_FORMAT ||
            "mp3_44100_128";


        /*
        |--------------------------------------------------------------------------
        | Provider must exist
        |--------------------------------------------------------------------------
        */
        if (
            !apiKey
        ) {

            /*
            |--------------------------------------------------------------------------
            | No ElevenLabs configured.
            |
            | Use fallback instead of blocking the user.
            |--------------------------------------------------------------------------
            */
            console.warn(
                "[TTS ROUTER] ElevenLabs API key missing. Using fallback TTS."
            );


            return generateFallbackSpeech({

                text,

                language,

                speed

            });
        }


        /*
        |--------------------------------------------------------------------------
        | Validate voice
        |--------------------------------------------------------------------------
        */
        if (
            !configuredVoice
        ) {

            throw createTtsError(
                "The selected voice is not configured correctly.",
                503,
                "TTS_VOICE_NOT_CONFIGURED"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Normalize text
        |--------------------------------------------------------------------------
        */
        const normalizedText =
            typeof text === "string"
                ? text.trim()
                : "";


        if (
            !normalizedText
        ) {

            throw createTtsError(
                "Speech text cannot be empty.",
                400,
                "TTS_EMPTY_TEXT"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Model character limit
        |--------------------------------------------------------------------------
        */
        const modelCharacterLimit =
            modelId ===
            "eleven_flash_v2_5"

                ? 40000

                : modelId ===
                "eleven_flash_v2"

                    ? 30000

                    : modelId ===
                    "eleven_multilingual_v2"

                        ? 10000

                        : 40000;


        const textCharacterCount =
            Array.from(
                normalizedText
            ).length;


        if (
            textCharacterCount >
            modelCharacterLimit
        ) {

            throw createTtsError(
                `This text is too long for the selected speech model. Maximum ${modelCharacterLimit.toLocaleString()} characters are allowed per request.`,
                400,
                "TTS_MAX_CHARACTER_LIMIT_EXCEEDED"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Safe voice settings
        |--------------------------------------------------------------------------
        */
        const safeSpeed =
            clamp(
                speed,
                0.7,
                1.2,
                1
            );


        const safeStability =
            clamp(
                stability,
                0,
                1,
                0.5
            );


        const safeSimilarity =
            clamp(
                similarityBoost,
                0,
                1,
                0.75
            );


        const safeStyle =
            clamp(
                style,
                0,
                1,
                0
            );


        /*
        |--------------------------------------------------------------------------
        | Provider quota preflight
        |--------------------------------------------------------------------------
        */
        const providerSubscription =
            await getProviderSubscription(
                apiKey
            );


        /*
        |--------------------------------------------------------------------------
        | Provider quota unavailable
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | We switch to fallback BEFORE calling ElevenLabs.
        |
        |--------------------------------------------------------------------------
        */
        if (
            providerSubscription &&
            providerSubscription.charactersRemaining <
            textCharacterCount
        ) {

            console.warn(
                "[TTS ROUTER] ElevenLabs quota insufficient. Using fallback TTS."
            );


            const fallbackResult =
                await generateFallbackSpeech({

                    text:
                    normalizedText,

                    language,

                    speed:
                    safeSpeed

                });


            return {

                ...fallbackResult,

                primaryProvider:
                    "ElevenLabs",

                fallbackReason:
                    "provider_quota"

            };
        }


        /*
        |--------------------------------------------------------------------------
        | ElevenLabs endpoint
        |--------------------------------------------------------------------------
        */
        const endpoint =
            `${ELEVENLABS_BASE_URL}/text-to-speech/` +
            `${encodeURIComponent(
                configuredVoice
            )}` +
            `?output_format=` +
            `${encodeURIComponent(
                outputFormat
            )}`;


        /*
        |--------------------------------------------------------------------------
        | Request body
        |--------------------------------------------------------------------------
        */
        const requestBody = {

            text:
            normalizedText,

            model_id:
            modelId,

            voice_settings: {

                stability:
                safeStability,

                similarity_boost:
                safeSimilarity,

                style:
                safeStyle,

                use_speaker_boost:
                    Boolean(
                        useSpeakerBoost
                    ),

                speed:
                safeSpeed

            }

        };


        let response;


        /*
        |--------------------------------------------------------------------------
        | Request ElevenLabs
        |--------------------------------------------------------------------------
        */
        try {

            response =
                await fetch(
                    endpoint,
                    {
                        method:
                            "POST",

                        headers: {

                            "xi-api-key":
                            apiKey,

                            "Content-Type":
                                "application/json",

                            Accept:
                                "audio/mpeg"

                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )

                    }
                );

        } catch (
            networkCause
            ) {

            console.warn(
                "[TTS ROUTER] ElevenLabs network failure. Using fallback TTS."
            );


            const fallbackResult =
                await generateFallbackSpeech({

                    text:
                    normalizedText,

                    language,

                    speed:
                    safeSpeed

                });


            return {

                ...fallbackResult,

                primaryProvider:
                    "ElevenLabs",

                fallbackReason:
                    "network_error"

            };
        }


        /*
        |--------------------------------------------------------------------------
        | Provider failure
        |--------------------------------------------------------------------------
        */
        if (
            !response.ok
        ) {

            let providerStatus =
                "";


            let providerMessage =
                "";


            try {

                const errorData =
                    await response.json();


                providerStatus =
                    errorData
                        ?.detail
                        ?.status ||
                    errorData
                        ?.status ||
                    "";


                providerMessage =
                    errorData
                        ?.detail
                        ?.message ||
                    errorData
                        ?.message ||
                    "";

            } catch {
                /*
                 * Non-JSON provider response.
                 */
            }


            const normalizedProviderMessage =
                providerMessage
                    .toLowerCase();


            /*
            |--------------------------------------------------------------------------
            | Provider quota
            |--------------------------------------------------------------------------
            */
            if (
                providerStatus ===
                "quota_exceeded" ||

                response.status ===
                402 ||

                normalizedProviderMessage.includes(
                    "quota"
                ) ||

                normalizedProviderMessage.includes(
                    "credits"
                ) ||

                normalizedProviderMessage.includes(
                    "payment required"
                )
            ) {

                console.warn(
                    "[TTS ROUTER] ElevenLabs quota error. Using fallback TTS."
                );


                const fallbackResult =
                    await generateFallbackSpeech({

                        text:
                        normalizedText,

                        language,

                        speed:
                        safeSpeed

                    });


                return {

                    ...fallbackResult,

                    primaryProvider:
                        "ElevenLabs",

                    fallbackReason:
                        "provider_quota"

                };
            }


            /*
            |--------------------------------------------------------------------------
            | Rate limiting / concurrency
            |--------------------------------------------------------------------------
            */
            if (
                response.status ===
                429
            ) {

                console.warn(
                    "[TTS ROUTER] ElevenLabs rate/concurrency limit. Using fallback TTS."
                );


                const fallbackResult =
                    await generateFallbackSpeech({

                        text:
                        normalizedText,

                        language,

                        speed:
                        safeSpeed

                    });


                return {

                    ...fallbackResult,

                    primaryProvider:
                        "ElevenLabs",

                    fallbackReason:
                        "rate_limited"

                };
            }


            /*
            |--------------------------------------------------------------------------
            | Provider temporarily unavailable
            |--------------------------------------------------------------------------
            */
            if (
                response.status >=
                500
            ) {

                console.warn(
                    "[TTS ROUTER] ElevenLabs unavailable. Using fallback TTS."
                );


                const fallbackResult =
                    await generateFallbackSpeech({

                        text:
                        normalizedText,

                        language,

                        speed:
                        safeSpeed

                    });


                return {

                    ...fallbackResult,

                    primaryProvider:
                        "ElevenLabs",

                    fallbackReason:
                        "provider_unavailable"

                };
            }


            /*
            |--------------------------------------------------------------------------
            | Invalid API key
            |--------------------------------------------------------------------------
            */
            if (
                providerStatus ===
                "invalid_api_key" ||

                response.status ===
                401
            ) {

                /*
                |--------------------------------------------------------------------------
                | We don't silently replace a broken API key.
                |
                | This is an administrator configuration error.
                |--------------------------------------------------------------------------
                */
                throw createTtsError(
                    "Speech generation is temporarily unavailable.",
                    503,
                    "TTS_AUTHENTICATION_FAILED"
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Voice not found
            |--------------------------------------------------------------------------
            */
            if (
                providerStatus ===
                "voice_not_found"
            ) {

                throw createTtsError(
                    "The selected voice is no longer available.",
                    400,
                    "TTS_VOICE_NOT_FOUND"
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Other provider request error
            |--------------------------------------------------------------------------
            */
            throw createTtsError(
                "Speech generation could not be completed. Please try again.",
                400,
                "TTS_PROVIDER_BAD_REQUEST"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Read ElevenLabs audio
        |--------------------------------------------------------------------------
        */
        const audioBuffer =
            Buffer.from(
                await response.arrayBuffer()
            );


        /*
        |--------------------------------------------------------------------------
        | Return ElevenLabs result
        |--------------------------------------------------------------------------
        */
        return {

            audioBuffer,

            contentType:
                response.headers.get(
                    "content-type"
                ) ||
                "audio/mpeg",

            contentLength:
            audioBuffer.length,

            voice:
            configuredVoice,

            language,

            modelId,

            outputFormat,

            provider:
                "elevenlabs",

            fallback:
                false,

            settings: {

                speed:
                safeSpeed,

                stability:
                safeStability,

                similarityBoost:
                safeSimilarity,

                style:
                safeStyle,

                useSpeakerBoost:
                    Boolean(
                        useSpeakerBoost
                    )

            }

        };
    };