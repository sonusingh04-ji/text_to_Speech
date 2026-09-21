import "dotenv/config";

import {
    execFile
} from "child_process";

import {
    promisify
} from "util";

import {
    fileURLToPath
} from "url";

import {
    dirname,
    join
} from "path";

const execFileAsync =
    promisify(execFile);


/*
|--------------------------------------------------------------------------
| Server Directory
|--------------------------------------------------------------------------
*/
const __filename =
    fileURLToPath(
        import.meta.url
    );

const __dirname =
    dirname(__filename);

const SERVER_ROOT =
    join(
        __dirname,
        ".."
    );


/*
|--------------------------------------------------------------------------
| Local Argos Translate Executable
|--------------------------------------------------------------------------
|
| We directly use the executable inside the
| Python virtual environment.
|
| No terminal activation is required.
|
|--------------------------------------------------------------------------
*/
const ARGOS_TRANSLATE_BINARY =
    join(
        SERVER_ROOT,
        "translation-env",
        "bin",
        "argos-translate"
    );


/*
|--------------------------------------------------------------------------
| Application Language → Argos Language
|--------------------------------------------------------------------------
*/
const LANGUAGE_MAP = {
    "en-US": "en",
    "hi-IN": "hi",
    "gu-IN": "gu",
    "mr-IN": "mr",
    "es-ES": "es",
    "fr-FR": "fr",
    "de-DE": "de"
};


/*
|--------------------------------------------------------------------------
| Get Argos Language Code
|--------------------------------------------------------------------------
*/
export const getTranslationLanguageCode = (
    applicationLanguage
) => {
    const code =
        LANGUAGE_MAP[
            applicationLanguage
            ];

    if (!code) {
        const error =
            new Error(
                `Translation is not configured for language: ${applicationLanguage}`
            );

        error.statusCode = 400;
        error.code =
            "UNSUPPORTED_TRANSLATION_LANGUAGE";

        throw error;
    }

    return code;
};


/*
|--------------------------------------------------------------------------
| Check Same Language
|--------------------------------------------------------------------------
*/
export const isSameLanguage = (
    sourceLanguage,
    targetLanguage
) => {
    return (
        getTranslationLanguageCode(
            sourceLanguage
        ) ===
        getTranslationLanguageCode(
            targetLanguage
        )
    );
};


/*
|--------------------------------------------------------------------------
| Translate Text Locally
|--------------------------------------------------------------------------
*/
export const translateText =
    async ({
               text,
               sourceLanguage,
               targetLanguage
           }) => {

        /*
        |--------------------------------------------------------------------------
        | Validate text
        |--------------------------------------------------------------------------
        */
        if (
            typeof text !== "string" ||
            !text.trim()
        ) {
            const error =
                new Error(
                    "Text is required for translation."
                );

            error.statusCode = 400;
            error.code =
                "TEXT_REQUIRED";

            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | Validate source language
        |--------------------------------------------------------------------------
        */
        if (
            typeof sourceLanguage !== "string" ||
            !sourceLanguage.trim()
        ) {
            const error =
                new Error(
                    "Source language is required."
                );

            error.statusCode = 400;
            error.code =
                "SOURCE_LANGUAGE_REQUIRED";

            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | Validate target language
        |--------------------------------------------------------------------------
        */
        if (
            typeof targetLanguage !== "string" ||
            !targetLanguage.trim()
        ) {
            const error =
                new Error(
                    "Target language is required."
                );

            error.statusCode = 400;
            error.code =
                "TARGET_LANGUAGE_REQUIRED";

            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | Convert application codes
        |--------------------------------------------------------------------------
        */
        const source =
            getTranslationLanguageCode(
                sourceLanguage
            );

        const target =
            getTranslationLanguageCode(
                targetLanguage
            );


        /*
        |--------------------------------------------------------------------------
        | Same-language request
        |--------------------------------------------------------------------------
        */
        if (source === target) {
            return {
                sourceLanguage,

                targetLanguage,

                translatedText:
                    text.trim(),

                provider:
                    "local",

                model:
                    "identity"
            };
        }


        /*
        |--------------------------------------------------------------------------
        | Check Argos executable
        |--------------------------------------------------------------------------
        */
        const executableExists =
            await checkArgosExecutable();

        if (!executableExists) {
            const error =
                new Error(
                    "Local Argos Translate is not installed correctly."
                );

            error.statusCode = 503;
            error.code =
                "LOCAL_TRANSLATOR_NOT_CONFIGURED";

            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | Run Argos Translate
        |--------------------------------------------------------------------------
        |
        | execFile is used instead of shell execution so
        | the user's text is passed as an argument rather
        | than being interpreted as shell commands.
        |
        |--------------------------------------------------------------------------
        */
        let result;

        try {
            result =
                await execFileAsync(
                    ARGOS_TRANSLATE_BINARY,

                    [
                        "--from",
                        source,

                        "--to",
                        target,

                        text.trim()
                    ],

                    {
                        cwd:
                        SERVER_ROOT,

                        maxBuffer:
                            1024 * 1024,

                        timeout:
                            120000,

                        env: {
                            ...process.env,

                            PYTHONUNBUFFERED:
                                "1"
                        }
                    }
                );

        } catch (providerError) {

            console.error(
                "Argos translation error:",
                providerError
            );

            const stderr =
                providerError?.stderr
                    ?.trim();

            const message =
                stderr ||
                providerError?.message ||
                "Local translation failed.";

            const translationError =
                new Error(
                    message
                );

            translationError.statusCode =
                503;

            translationError.code =
                "LOCAL_TRANSLATION_FAILED";

            translationError.cause =
                providerError;

            throw translationError;
        }


        /*
        |--------------------------------------------------------------------------
        | Read translated output
        |--------------------------------------------------------------------------
        */
        const translatedText =
            result?.stdout
                ?.trim();


        if (
            !translatedText
        ) {
            const error =
                new Error(
                    "Local translation returned empty text."
                );

            error.statusCode = 503;
            error.code =
                "EMPTY_TRANSLATION_RESULT";

            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | Return Translation Result
        |--------------------------------------------------------------------------
        */
        return {
            sourceLanguage,

            targetLanguage,

            translatedText,

            provider:
                "local",

            model:
                "argos-translate"
        };
    };


/*
|--------------------------------------------------------------------------
| Verify Argos Executable
|--------------------------------------------------------------------------
*/
const checkArgosExecutable =
    async () => {
        try {
            await execFileAsync(
                ARGOS_TRANSLATE_BINARY,
                [
                    "--help"
                ],
                {
                    cwd:
                    SERVER_ROOT,

                    timeout:
                        15000,

                    maxBuffer:
                        512 * 1024,

                    env: {
                        ...process.env,

                        PYTHONUNBUFFERED:
                            "1"
                    }
                }
            );

            return true;

        } catch {
            return false;
        }
    };