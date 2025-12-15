// src/services/api.js
import axios from "axios";
import { getAccessToken } from "../../utils/TokenUtilities/";

const api = axios.create({
    baseURL: "http://localhost:3000",
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = "Bearer " + token;
    }
    return config;
});

api.interceptors.response.use(
    res => res,
    err => {
        if (err?.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");

            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;