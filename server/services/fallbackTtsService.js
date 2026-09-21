import {
    EdgeTTS
} from "node-edge-tts";

import fs from "fs/promises";
import os from "os";
import path from "path";
import {
    randomUUID
} from "crypto";


/*
|--------------------------------------------------------------------------
| Fallback voices
|--------------------------------------------------------------------------
*/
const FALLBACK_VOICES = {

    "en-US": "en-US-AriaNeural",
    "en-IN": "en-IN-NeerjaNeural",

    "hi-IN": "hi-IN-SwaraNeural",
    "gu-IN": "gu-IN-DhwaniNeural",
    "mr-IN": "mr-IN-AarohiNeural",
    "ta-IN": "ta-IN-PallaviNeural",
    "te-IN": "te-IN-ShrutiNeural",

    "bn-IN": "bn-IN-TanishaaNeural",
    "kn-IN": "kn-IN-SapnaNeural",
    "ml-IN": "ml-IN-SobhanaNeural",

    "de-DE": "de-DE-KatjaNeural",
    "fr-FR": "fr-FR-DeniseNeural",
    "es-ES": "es-ES-ElviraNeural",
    "it-IT": "it-IT-ElsaNeural",
    "pt-BR": "pt-BR-FranciscaNeural",

    "ja-JP": "ja-JP-NanamiNeural",
    "ko-KR": "ko-KR-SunHiNeural",
    "zh-CN": "zh-CN-XiaoxiaoNeural",

    "id-ID": "id-ID-GadisNeural",
    "nl-NL": "nl-NL-ColetteNeural",
    "tr-TR": "tr-TR-EmelNeural",
    "pl-PL": "pl-PL-ZofiaNeural",
    "sv-SE": "sv-SE-SofieNeural",

    "ar-SA": "ar-SA-ZariyahNeural",
    "uk-UA": "uk-UA-PolinaNeural",
    "ru-RU": "ru-RU-SvetlanaNeural",

    "da-DK": "da-DK-ChristelNeural",
    "fi-FI": "fi-FI-SelmaNeural",
    "el-GR": "el-GR-AthinaNeural",
    "ro-RO": "ro-RO-AlinaNeural",
    "cs-CZ": "cs-CZ-VlastaNeural"

};


/*
|--------------------------------------------------------------------------
| Normalize language
|--------------------------------------------------------------------------
*/
const normalizeLanguage = (
    language
) => {

    const normalized =
        String(
            language ||
            "en-US"
        )
            .trim()
            .replace(
                "_",
                "-"
            );


    return normalized ||
        "en-US";
};


/*
|--------------------------------------------------------------------------
| Find fallback voice
|--------------------------------------------------------------------------
*/
const getFallbackVoice = (
    language
) => {

    const normalizedLanguage =
        normalizeLanguage(
            language
        );


    /*
    |--------------------------------------------------------------------------
    | Exact match
    |--------------------------------------------------------------------------
    */
    const exactVoice =
        FALLBACK_VOICES[
            normalizedLanguage
            ];


    if (
        exactVoice
    ) {

        return exactVoice;
    }


    /*
    |--------------------------------------------------------------------------
    | Language family match
    |--------------------------------------------------------------------------
    */
    const languagePrefix =
        normalizedLanguage
            .split("-")[0]
            .toLowerCase();


    const matchingEntry =
        Object.entries(
            FALLBACK_VOICES
        ).find(
            (
                [
                    key
                ]
            ) =>
                key
                    .split("-")[0]
                    .toLowerCase() ===
                languagePrefix
        );


    if (
        matchingEntry
    ) {

        return matchingEntry[1];
    }


    /*
    |--------------------------------------------------------------------------
    | Safe default
    |--------------------------------------------------------------------------
    */
    return FALLBACK_VOICES[
        "en-US"
        ];
};


/*
|--------------------------------------------------------------------------
| Convert application speed to Edge rate
|--------------------------------------------------------------------------
*/
const convertSpeedToRate = (
    speed
) => {

    const numericSpeed =
        Number(
            speed
        );


    if (
        !Number.isFinite(
            numericSpeed
        )
    ) {

        return "default";
    }


    const percentage =
        Math.round(
            (
                numericSpeed -
                1
            ) * 100
        );


    const safePercentage =
        Math.max(
            -30,
            Math.min(
                percentage,
                20
            )
        );


    if (
        safePercentage ===
        0
    ) {

        return "default";
    }


    return `${
        safePercentage > 0
            ? "+"
            : ""
    }${safePercentage}%`;
};


/*
|--------------------------------------------------------------------------
| Generate fallback speech
|--------------------------------------------------------------------------
*/
export const generateFallbackSpeech =
    async ({
               text,
               language,
               speed = 1
           }) => {

        const normalizedText =
            typeof text === "string"
                ? text.trim()
                : "";


        if (
            !normalizedText
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


        const normalizedLanguage =
            normalizeLanguage(
                language
            );


        const fallbackVoice =
            getFallbackVoice(
                normalizedLanguage
            );


        /*
        |--------------------------------------------------------------------------
        | Temporary MP3 location
        |--------------------------------------------------------------------------
        */
        const temporaryDirectory =
            await fs.mkdtemp(
                path.join(
                    os.tmpdir(),
                    "voice-studio-"
                )
            );


        const temporaryFile =
            path.join(
                temporaryDirectory,
                `${randomUUID()}.mp3`
            );


        try {

            /*
            |--------------------------------------------------------------------------
            | Configure Edge TTS
            |--------------------------------------------------------------------------
            */
            const tts =
                new EdgeTTS({

                    voice:
                    fallbackVoice,

                    lang:
                    normalizedLanguage,

                    outputFormat:
                        "audio-24khz-48kbitrate-mono-mp3",

                    rate:
                        convertSpeedToRate(
                            speed
                        ),

                    volume:
                        "default",

                    pitch:
                        "default",

                    timeout:
                        30000

                });


            /*
            |--------------------------------------------------------------------------
            | Generate MP3
            |--------------------------------------------------------------------------
            */
            await tts.ttsPromise(
                normalizedText,
                temporaryFile
            );


            /*
            |--------------------------------------------------------------------------
            | Read MP3 into Buffer
            |--------------------------------------------------------------------------
            */
            const audioBuffer =
                await fs.readFile(
                    temporaryFile
                );


            if (
                !audioBuffer ||
                !audioBuffer.length
            ) {

                throw new Error(
                    "Fallback TTS generated an empty audio file."
                );
            }


            console.log(
                `[TTS FALLBACK] Generated audio with ${fallbackVoice}.`
            );


            return {

                audioBuffer,

                contentType:
                    "audio/mpeg",

                contentLength:
                audioBuffer.length,

                voice:
                fallbackVoice,

                language:
                normalizedLanguage,

                modelId:
                    "edge-tts",

                outputFormat:
                    "audio-24khz-48kbitrate-mono-mp3",

                provider:
                    "edge-tts",

                fallback:
                    true,

                settings: {

                    speed:
                        Number(
                            speed
                        ),

                    stability:
                        0.5,

                    similarityBoost:
                        0.75,

                    style:
                        0,

                    useSpeakerBoost:
                        false

                }

            };

        } catch (
            cause
            ) {

            console.error(
                "[TTS FALLBACK] Generation failed:",
                cause?.message ||
                cause
            );


            const error =
                new Error(
                    "Fallback speech generation is temporarily unavailable."
                );


            error.statusCode =
                503;


            error.code =
                "TTS_FALLBACK_UNAVAILABLE";


            error.cause =
                cause;


            throw error;

        } finally {

            /*
            |--------------------------------------------------------------------------
            | Remove temporary files
            |--------------------------------------------------------------------------
            */
            try {

                await fs.rm(
                    temporaryDirectory,
                    {
                        recursive:
                            true,

                        force:
                            true
                    }
                );

            } catch {
                /*
                 * Cleanup failure should not
                 * affect the request.
                 */
            }
        }
    };