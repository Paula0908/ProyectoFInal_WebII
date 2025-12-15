// src/pages/organizer/OrganizerEventRegistrationsPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Container,
    Table,
    Spinner,
    Alert,
    Button,
    Badge,
} from "react-bootstrap";
import {
    getRegistrationsByEvent,
    updateRegistrationStatus,
} from "../../services/RegistrationsService";

const statusVariant = status => {
    switch (status) {
        case "PENDING":
            return "warning";
        case "ACCEPTED":
            return "success";
        case "REJECTED":
            return "danger";
        case "USED":
            return "secondary";
        default:
            return "secondary";
    }
};

const OrganizerEventRegistrationsPage = () => {
    const { eventId } = useParams();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState(null);

    const loadData = () => {
        setLoading(true);
        setError("");

        getRegistrationsByEvent(Number(eventId))
            .then(data => setRegistrations(data))
            .catch(err => {
                console.error(err);
                setError("No se pudieron cargar las inscripciones.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const handleChangeStatus = (regId, newStatus) => {
        if (
            !window.confirm(
                `¿Seguro que deseas marcar esta inscripción como ${newStatus}?`,
            )
        ) {
            return;
        }

        setSavingId(regId);
        setError("");

        updateRegistrationStatus(regId, newStatus)
            .then(() => {
                loadData();
            })
            .catch(err => {
                console.error(err);
                const msg =
                    err?.response?.data?.message ||
                    "No se pudo actualizar el estado.";
                setError(Array.isArray(msg) ? msg.join(" ") : msg);
            })
            .finally(() => setSavingId(null));
    };

    const formatDateTime = iso => {
        if (!iso) return "";
        return new Date(iso).toLocaleString();
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <Container className="mt-3">
                <div className="d-flex justify-content-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <Container className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Inscripciones del evento #{eventId}</h1>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        onClick={handlePrint}
                        disabled={registrations.length === 0}
                    >
                        Descargar / Imprimir lista
                    </Button>
                    <Button as={Link} to="/organizer/events" variant="secondary">
                        Volver a mis eventos
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {registrations.length === 0 ? (
                <Alert variant="info">
                    Aún no hay inscripciones para este evento.
                </Alert>
            ) : (
                <div id="registrations-table">
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Participante</th>
                                <th>Email</th>
                                <th>Fecha de registro</th>
                                <th>Comprobante</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.map((reg, index) => (
                                <tr key={reg.id}>
                                    <td>{index + 1}</td>
                                    <td>{reg.participant?.fullName}</td>
                                    <td>{reg.participant?.email}</td>
                                    <td>
                                        {formatDateTime(
                                            reg.createdAt || reg.created_at,
                                        )}
                                    </td>
                                    <td>
                                        {reg.paymentProofUrl ? (
                                            <a
                                                href={`http://localhost:3000${reg.paymentProofUrl}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Ver comprobante
                                            </a>
                                        ) : (
                                            <span className="text-muted">
                                                — Sin comprobante —
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <Badge bg={statusVariant(reg.status)}>
                                            {reg.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        {reg.status === "PENDING" ? (
                                            <>
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    className="me-2"
                                                    disabled={savingId === reg.id}
                                                    onClick={() =>
                                                        handleChangeStatus(
                                                            reg.id,
                                                            "ACCEPTED",
                                                        )
                                                    }
                                                >
                                                    {savingId === reg.id
                                                        ? "Guardando..."
                                                        : "Aceptar"}
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    disabled={savingId === reg.id}
                                                    onClick={() =>
                                                        handleChangeStatus(
                                                            reg.id,
                                                            "REJECTED",
                                                        )
                                                    }
                                                >
                                                    {savingId === reg.id
                                                        ? "Guardando..."
                                                        : "Rechazar"}
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-muted">
                                                Sin acciones
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default OrganizerEventRegistrationsPage;
