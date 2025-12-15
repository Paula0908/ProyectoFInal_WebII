// src/services/RegistrationsService.js
import api from "./api";


export const registerToEvent = (eventId, paymentProofFile) => {
    const formData = new FormData();
    if (paymentProofFile) {
        formData.append("paymentProof", paymentProofFile);
    }

    return api
        .post(`/registrations/events/${eventId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then(res => res.data);
};


export const getMyRegistrations = () =>
    api.get("/registrations/my").then(res => res.data);


export const updatePaymentProof = (registrationId, file) => {
    const formData = new FormData();
    formData.append("paymentProof", file);

    return api
        .patch(`/registrations/${registrationId}/payment-proof`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then(res => res.data);
};


export const cancelRegistration = registrationId =>
    api.delete(`/registrations/${registrationId}`).then(res => res.data);


export const getRegistrationsByEvent = eventId =>
    api.get(`/registrations/events/${eventId}`).then(res => res.data);

export const updateRegistrationStatus = (registrationId, status) =>
    api
        .patch(`/registrations/${registrationId}/status`, { status })
        .then(res => res.data);

export const validateQrToken = qrToken =>
    api
        .post("/registrations/validate", { qrToken })
        .then(res => res.data);
