import {
    getConfiguredVoices,
    languages
} from "../utils/voices.js";

import {
    generateSpeech
} from "../services/ttsService.js";

import {
    createHistory
} from "../services/historyService.js";

import {
    checkUsageLimit,
    recordUsage
} from "../services/usageService.js";

import {
    saveAudioToCloud
} from "../services/cloudStorageService.js";


/*
|--------------------------------------------------------------------------
| Get Voices
|--------------------------------------------------------------------------
*/
export const getVoices = (
    req,
    res
) => {

    const voices =
        getConfiguredVoices();


    return res.status(200).json({

        success:
            true,

        count:
        voices.length,

        provider:
            "elevenlabs",

        voices

    });
};


/*
|--------------------------------------------------------------------------
| Get Languages
|--------------------------------------------------------------------------
*/
export const getLanguages = (
    req,
    res
) => {

    return res.status(200).json({

        success:
            true,

        count:
        languages.length,

        languages

    });
};


/*
|--------------------------------------------------------------------------
| Create Speech
|--------------------------------------------------------------------------
*/
export const createSpeech =
    async (
        req,
        res,
        next
    ) => {

        try {

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

            } = req.body;


            /*
            |--------------------------------------------------------------------------
            | Validate text before Array.from()
            |--------------------------------------------------------------------------
            */
            if (
                typeof text !== "string" ||
                !text.trim()
            ) {

                const error =
                    new Error(
                        "Speech text cannot be empty."
                    );


                error.statusCode =
                    400;


                error.code =
                    "TTS_EMPTY_TEXT";


                throw error;
            }


            /*
            |--------------------------------------------------------------------------
            | Character count
            |--------------------------------------------------------------------------
            */
            const characterCount =
                Array.from(
                    text.trim()
                ).length;


            /*
            |--------------------------------------------------------------------------
            | Application usage quota
            |--------------------------------------------------------------------------
            |
            | This is YOUR application's quota.
            |
            | It remains independent of ElevenLabs.
            |--------------------------------------------------------------------------
            */
            await checkUsageLimit({

                userId:
                req.user.id,

                charactersToUse:
                characterCount

            });


            /*
            |--------------------------------------------------------------------------
            | Generate speech
            |--------------------------------------------------------------------------
            |
            | ElevenLabs is attempted first.
            |
            | Fallback is automatically selected inside
            | generateSpeech() if the primary provider
            | cannot fulfill the request.
            |--------------------------------------------------------------------------
            */
            const result =
                await generateSpeech({

                    text,

                    language,

                    voice,

                    speed,

                    stability,

                    similarityBoost,

                    style,

                    useSpeakerBoost

                });


            /*
            |--------------------------------------------------------------------------
            | Save audio to Supabase
            |--------------------------------------------------------------------------
            */
            const storedAudio =
                await saveAudioToCloud(

                    result.audioBuffer,

                    "mp3",

                    result.contentType ||
                    "audio/mpeg"

                );


            /*
            |--------------------------------------------------------------------------
            | Save speech history
            |--------------------------------------------------------------------------
            */
            await createHistory({

                userId:
                req.user.id,

                text,

                language,

                voiceId:
                result.voice,

                audioUrl:
                storedAudio.publicUrl,

                audioFormat:
                    "mp3",

                durationSeconds:
                    null

            });


            /*
            |--------------------------------------------------------------------------
            | Record application usage
            |--------------------------------------------------------------------------
            |
            | We count usage once, regardless of which TTS
            | provider actually generated the audio.
            |--------------------------------------------------------------------------
            */
            await recordUsage({

                userId:
                req.user.id,

                charactersUsed:
                characterCount

            });


            /*
            |--------------------------------------------------------------------------
            | Response disposition
            |--------------------------------------------------------------------------
            */
            const disposition =
                download
                    ? "attachment"
                    : "inline";


            /*
            |--------------------------------------------------------------------------
            | Provider name
            |--------------------------------------------------------------------------
            */
            const provider =
                result.provider ||
                "elevenlabs";


            /*
            |--------------------------------------------------------------------------
            | Fallback indicator
            |--------------------------------------------------------------------------
            */
            const isFallback =
                Boolean(
                    result.fallback
                );


            /*
            |--------------------------------------------------------------------------
            | Response headers
            |--------------------------------------------------------------------------
            */
            res.set({

                "Content-Type":
                result.contentType,

                "Content-Length":
                result.contentLength,

                "Content-Disposition":
                    `${disposition}; filename="speech.mp3"`,

                "Cache-Control":
                    "no-store",

                "X-TTS-Provider":
                provider,

                "X-TTS-Fallback":
                    String(
                        isFallback
                    ),

                "X-TTS-Fallback-Reason":
                    result.fallbackReason ||
                    "",

                "X-Audio-URL":
                storedAudio.publicUrl,

                "X-TTS-Speed":
                    String(
                        result.settings.speed
                    ),

                "X-TTS-Stability":
                    String(
                        result.settings.stability
                    ),

                "X-TTS-Similarity":
                    String(
                        result.settings.similarityBoost
                    ),

                "X-TTS-Style":
                    String(
                        result.settings.style
                    ),

                "X-TTS-Speaker-Boost":
                    String(
                        result.settings.useSpeakerBoost
                    )

            });


            /*
            |--------------------------------------------------------------------------
            | Backend log
            |--------------------------------------------------------------------------
            */
            console.log(
                `[TTS] provider=${provider} fallback=${isFallback} characters=${characterCount}`
            );


            /*
            |--------------------------------------------------------------------------
            | Send MP3
            |--------------------------------------------------------------------------
            */
            return res
                .status(200)
                .send(
                    result.audioBuffer
                );

        } catch (
            error
            ) {

            next(
                error
            );
        }
    };