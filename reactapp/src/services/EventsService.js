// src/services/EventsService.js
import api from "./api";

export const getAllEvents = () =>
    api.get("/events/all").then(res => res.data);

export const getEventById = (id) =>
    api.get(`/events/${id}`).then(res => res.data);

export const getMyEvents = () =>
    api.get("/events/mine").then(res => res.data);

export const createEvent = (data) =>
    api.post("/events", data).then(res => res.data);

export const updateEvent = (id, data) =>
    api.patch(`/events/${id}`, data).then(res => res.data);

export const uploadEventImage = (id, file) => {
    const formData = new FormData();
    formData.append("image", file);

    return api
        .post(`/events/${id}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then(res => res.data);
};

export const getEventStats = (id) =>
    api.get(`/events/${id}/stats`).then(res => res.data);

export const deleteEvent = (id) =>
    api.delete(`/events/${id}`).then(res => res.data);