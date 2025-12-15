// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import 'leaflet/dist/leaflet.css';


import Header from "./components/Header";

// Auth
import FormLogin from "./pages/auth/FormLogin";
import FormRegister from "./pages/auth/FormRegister";

// Eventos
import EventsPublicPage from "./pages/events/EventsPublicPage";
import EventDetailPage from "./pages/events/EventDetailPage";

// PARTICIPANT
import MyRegistrationsPage from "./pages/participant/MyRegistrationsPage";

// ORGANIZER
import OrganizerEventsPage from "./pages/organizer/OrganizerEventsPage";
import OrganizerReportsPage from "./pages/organizer/OrganizerReportsPage";
import OrganizerNewEventPage from "./pages/organizer/OrganizerNewEventPage";
import OrganizerEditEventPage from "./pages/organizer/OrganizerEditEventPage";
import OrganizerEventRegistrationsPage from "./pages/organizer/OrganizerEventRegistrationsPage";

// ADMIN
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminNewUserPage from "./pages/admin/AdminNewUserPage";
//VALIDATOR
import ValidatorScanPage from "./pages/validator/ValidatorScanPage";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Header />

      <Routes>
        {/* Públicas */}
        <Route path="/" element={<EventsPublicPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        {/* Auth */}
        <Route path="/login" element={<FormLogin />} />
        <Route path="/register" element={<FormRegister />} />

        {/* PARTICIPANT */}
        <Route path="/me/registrations" element={<MyRegistrationsPage />} />

        {/* ORGANIZER */}
        <Route path="/organizer/events" element={<OrganizerEventsPage />} />
        <Route
          path="/organizer/events/:eventId/registrations"
          element={<OrganizerEventRegistrationsPage />}
        />
        <Route path="/organizer/events" element={<OrganizerEventsPage />} />
        <Route path="/organizer/events/new" element={<OrganizerNewEventPage />} />

        <Route
          path="/organizer/events/:eventId/edit"
          element={<OrganizerEditEventPage />}
        />
        <Route
          path="/organizer/events/:eventId/registrations"
          element={<OrganizerEventRegistrationsPage />}
        />
        <Route path="/organizer/reports" element={<OrganizerReportsPage />} />

        {/* ADMIN */}
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/new" element={<AdminNewUserPage />} />
        
        {/* VALIDATOR */}
        <Route path="/validator/scan" element={<ValidatorScanPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
