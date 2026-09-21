import api from "./api.js";


/*
|--------------------------------------------------------------------------
| Get Speech History
|--------------------------------------------------------------------------
*/
export const getHistory = async () => {

    const response =
        await api.get(
            "/api/history"
        );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Get Single History Item
|--------------------------------------------------------------------------
*/
export const getHistoryById = async (
    historyId
) => {

    const response =
        await api.get(
            `/api/history/${historyId}`
        );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Delete History Item
|--------------------------------------------------------------------------
*/
export const deleteHistory = async (
    historyId
) => {

    const response =
        await api.delete(
            `/api/history/${historyId}`
        );

    return response.data;
};