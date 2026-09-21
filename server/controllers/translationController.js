import {
    languages
} from "../utils/voices.js";

import {
    translateText,
    getTranslationLanguageCode
} from "../services/translationService.js";


const handleTranslation =
    async (
        req,
        res,
        next
    ) => {
        try {
            const body =
                req.body || {};

            const {
                text,
                sourceLanguage,
                targetLanguage
            } = body;


            /*
            |--------------------------------------------------------------------------
            | Text
            |--------------------------------------------------------------------------
            */
            if (
                typeof text !==
                "string" ||
                !text.trim()
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Text is required.",
                        code:
                            "TEXT_REQUIRED"
                    });
            }


            /*
            |--------------------------------------------------------------------------
            | Maximum translation text
            |--------------------------------------------------------------------------
            */
            if (
                text.length >
                10000
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Text exceeds the maximum allowed length of 10000 characters.",
                        code:
                            "TEXT_TOO_LONG"
                    });
            }


            /*
            |--------------------------------------------------------------------------
            | Source language
            |--------------------------------------------------------------------------
            */
            if (
                typeof sourceLanguage !==
                "string" ||
                !sourceLanguage.trim()
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Source language is required.",
                        code:
                            "SOURCE_LANGUAGE_REQUIRED"
                    });
            }


            /*
            |--------------------------------------------------------------------------
            | Target language
            |--------------------------------------------------------------------------
            */
            if (
                typeof targetLanguage !==
                "string" ||
                !targetLanguage.trim()
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Target language is required.",
                        code:
                            "TARGET_LANGUAGE_REQUIRED"
                    });
            }


            /*
            |--------------------------------------------------------------------------
            | Validate against application languages
            |--------------------------------------------------------------------------
            */
            const supportedLanguages =
                languages.map(
                    (item) =>
                        item.code
                );


            if (
                !supportedLanguages.includes(
                    sourceLanguage
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            `Unsupported source language: ${sourceLanguage}`,
                        code:
                            "UNSUPPORTED_SOURCE_LANGUAGE"
                    });
            }


            if (
                !supportedLanguages.includes(
                    targetLanguage
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            `Unsupported target language: ${targetLanguage}`,
                        code:
                            "UNSUPPORTED_TARGET_LANGUAGE"
                    });
            }


            /*
            |--------------------------------------------------------------------------
            | Validate translation mappings
            |--------------------------------------------------------------------------
            */
            getTranslationLanguageCode(
                sourceLanguage
            );

            getTranslationLanguageCode(
                targetLanguage
            );


            /*
            |--------------------------------------------------------------------------
            | Translate
            |--------------------------------------------------------------------------
            */
            const result =
                await translateText({
                    text:
                        text.trim(),

                    sourceLanguage,

                    targetLanguage
                });


            return res
                .status(200)
                .json({
                    success: true,

                    sourceLanguage:
                    result.sourceLanguage,

                    targetLanguage:
                    result.targetLanguage,

                    provider:
                    result.provider,

                    model:
                    result.model,

                    originalText:
                        text.trim(),

                    translatedText:
                    result.translatedText
                });

        } catch (error) {
            next(error);
        }
    };


export const translate =
    handleTranslation;