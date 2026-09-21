import api from "./api.js";


/*
|--------------------------------------------------------------------------
| Get Languages
|--------------------------------------------------------------------------
*/
export const getLanguages =
    async () => {

        const response =
            await api.get(
                "/api/languages"
            );

        return response.data;
    };


/*
|--------------------------------------------------------------------------
| Get Voices
|--------------------------------------------------------------------------
*/
export const getVoices =
    async () => {

        const response =
            await api.get(
                "/api/voices"
            );

        return response.data;
    };


/*
|--------------------------------------------------------------------------
| Convert Blob Error Response to JSON
|--------------------------------------------------------------------------
*/
const parseBlobError =
    async (
        error
    ) => {

        const responseData =
            error?.response?.data;


        /*
        |--------------------------------------------------------------------------
        | Normal JSON response
        |--------------------------------------------------------------------------
        */
        if (
            responseData &&
            typeof responseData ===
            "object" &&
            !(responseData instanceof Blob)
        ) {

            return responseData;
        }


        /*
        |--------------------------------------------------------------------------
        | Blob response
        |--------------------------------------------------------------------------
        */
        if (
            responseData instanceof Blob
        ) {

            try {

                const text =
                    await responseData.text();


                if (!text.trim()) {
                    return null;
                }


                return JSON.parse(
                    text
                );

            } catch {
                return null;
            }
        }


        return null;
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
               speed,
               stability,
               similarityBoost,
               style,
               useSpeakerBoost
           }) => {

        try {

            const response =
                await api.post(
                    "/api/tts",

                    {
                        text,

                        language,

                        voice,

                        speed,

                        stability,

                        similarityBoost,

                        style,

                        useSpeakerBoost,

                        download:
                            false
                    },

                    {
                        responseType:
                            "blob"
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | Successful audio response
            |--------------------------------------------------------------------------
            */
            return {

                blob:
                response.data,

                audioUrl:
                    URL.createObjectURL(
                        response.data
                    ),

                cloudAudioUrl:
                    response.headers[
                        "x-audio-url"
                        ] || null
            };

        } catch (
            error
            ) {

            /*
            |--------------------------------------------------------------------------
            | Parse JSON error returned as Blob
            |--------------------------------------------------------------------------
            */
            const parsedError =
                await parseBlobError(
                    error
                );


            if (
                parsedError
            ) {

                const enhancedError =
                    new Error(
                        parsedError.message ||
                        "Speech generation failed."
                    );


                enhancedError.response = {
                    ...error.response,

                    data:
                    parsedError
                };


                enhancedError.code =
                    parsedError.code ||
                    error.code;


                enhancedError.status =
                    error.response?.status;


                throw enhancedError;
            }


            /*
            |--------------------------------------------------------------------------
            | Normal Axios error
            |--------------------------------------------------------------------------
            */
            throw error;
        }
    };