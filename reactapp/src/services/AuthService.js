// src/services/AuthService.js
import api from "./api";

export const login = (loginData) =>
    api.post("/auth/login", loginData)
        .then((res) => res.data);

export const register = (registerData) =>
    api.post("/auth/register", registerData)
        .then((res) => res.data);
