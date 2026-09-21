import api from "./api.js";


/*
|--------------------------------------------------------------------------
| Generic AI Enhancement Request
|--------------------------------------------------------------------------
*/
const enhanceText = async (
    endpoint,
    text
) => {

    if (
        typeof text !== "string" ||
        !text.trim()
    ) {
        throw new Error(
            "Text is required."
        );
    }


    const response =
        await api.post(
            `/api/ai/${endpoint}`,
            {
                text: text.trim()
            }
        );


    return response.data;
};


/*
|--------------------------------------------------------------------------
| Summarize
|--------------------------------------------------------------------------
*/
export const summarizeText =
    async (
        text
    ) => {

        return enhanceText(
            "summarize",
            text
        );
    };


/*
|--------------------------------------------------------------------------
| Grammar Correction
|--------------------------------------------------------------------------
*/
export const correctGrammar =
    async (
        text
    ) => {

        return enhanceText(
            "grammar",
            text
        );
    };


/*
|--------------------------------------------------------------------------
| Rewrite
|--------------------------------------------------------------------------
*/
export const rewriteText =
    async (
        text
    ) => {

        return enhanceText(
            "rewrite",
            text
        );
    };


/*
|--------------------------------------------------------------------------
| Conversational
|--------------------------------------------------------------------------
*/
export const makeConversational =
    async (
        text
    ) => {

        return enhanceText(
            "conversational",
            text
        );
    };