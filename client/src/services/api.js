import axios from "axios";


const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5050";


const api = axios.create({
    baseURL:
    API_BASE_URL,

    timeout:
        120000
});


api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem(
                "tts_token"
            );


        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }


        return config;
    },

    (error) =>
        Promise.reject(error)
);


export default api;