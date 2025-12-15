// src/services/UsersService.js
import api from "./api";

export const getAllUsers = () =>
    api.get("/users").then(res => res.data);

export const createUserByAdmin = data =>
    api.post("/users", data).then(res => res.data);

export const updateUserByAdmin = (id, data) =>
    api.patch(`/users/${id}`, data).then(res => res.data);

export const deleteUserByAdmin = id =>
    api.delete(`/users/${id}`).then(res => res.data);
