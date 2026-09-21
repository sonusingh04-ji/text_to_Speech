import api from "./api.js";

/*
|--------------------------------------------------------------------------
| Translate text using backend
|--------------------------------------------------------------------------
*/
export const translateText = async ({
                                        text,
                                        sourceLanguage,
                                        targetLanguage
                                    }) => {
    const response = await api.post(
        "/api/translate",
        {
            text,
            sourceLanguage,
            targetLanguage
        }
    );

    return response.data;
};