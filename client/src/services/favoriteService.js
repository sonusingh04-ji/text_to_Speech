import api from "./api.js";


/*
|--------------------------------------------------------------------------
| Add Favorite
|--------------------------------------------------------------------------
*/
export const addFavorite = async (
    historyId
) => {

    const response =
        await api.post(
            `/api/favorites/${historyId}`
        );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Get All Favorites
|--------------------------------------------------------------------------
*/
export const getFavorites = async () => {

    const response =
        await api.get(
            "/api/favorites"
        );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Check Favorite
|--------------------------------------------------------------------------
*/
export const isFavorite = async (
    historyId
) => {

    const response =
        await api.get(
            `/api/favorites/${historyId}/check`
        );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Remove Favorite
|--------------------------------------------------------------------------
*/
export const removeFavorite = async (
    historyId
) => {

    const response =
        await api.delete(
            `/api/favorites/${historyId}`
        );

    return response.data;
};