import api from "./api.js";

export const getUsage = async () => {
    const response = await api.get(
        "/api/usage"
    );

    return response.data;
};