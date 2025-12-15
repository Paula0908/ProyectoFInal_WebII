// src/pages/organizer/OrganizerEventsPage.jsx
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { getMyEvents, deleteEvent } from "../../services/EventsService";
import { Link } from "react-router-dom";

const OrganizerEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError("");

        getMyEvents()
            .then(data => setEvents(data))
            .catch(err => {
                console.error(err);
                const msg = err?.response?.data?.message || "No se pudieron cargar tus eventos.";
                setError(Array.isArray(msg) ? msg.join(" ") : msg);
            })
            .finally(() => setLoading(false));
    }, []);

    const formatDateTime = iso => {
        if (!iso) return "";
        return new Date(iso).toLocaleString();
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("¿Seguro que deseas eliminar este evento?");
        if (!ok) return;

        setDeletingId(id);
        setError("");

        try {
            await deleteEvent(id);
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                "No se pudo eliminar el evento (revisa si tiene inscripciones).";
            alert(Array.isArray(msg) ? msg.join(" ") : msg);
        } finally {
            setDeletingId(null);
        }
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

    if (error) {
        return (
            <Container className="mt-3">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Mis eventos</h1>
                <Button as={Link} to="/organizer/events/new" variant="primary" size="sm">
                    Crear evento
                </Button>
            </div>

            {events.length === 0 && (
                <Alert variant="info">Aún no has creado eventos.</Alert>
            )}

            <Row className="mt-3">
                {events.map(ev => (
                    <Col md={6} lg={4} key={ev.id} className="mb-3">
                        <Card>
                            {ev.imagePath && (
                                <Card.Img
                                    variant="top"
                                    src={`http://localhost:3000${ev.imagePath}`}
                                    alt={ev.title}
                                    style={{ maxHeight: "160px", objectFit: "cover" }}
                                />
                            )}
                            <Card.Body>
                                <Card.Title>{ev.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    {formatDateTime(ev.dateTime)}
                                </Card.Subtitle>
                                <p className="mb-1">
                                    <strong>Cupos máximos:</strong> {ev.capacityMax}
                                </p>
                                <p className="mb-1">
                                    <strong>Precio:</strong>{" "}
                                    {Number(ev.price || 0) === 0 ? "Gratuito" : `${ev.price} Bs`}
                                </p>

                                <div className="mt-2 d-flex flex-wrap gap-2">
                                    <Button
                                        as={Link}
                                        to={`/events/${ev.id}`}
                                        variant="outline-light"
                                        size="sm"
                                    >
                                        Ver detalle
                                    </Button>

                                    <Button
                                        as={Link}
                                        to={`/organizer/events/${ev.id}/registrations`}
                                        variant="outline-primary"
                                        size="sm"
                                    >
                                        Ver inscripciones
                                    </Button>

                                    <Button
                                        as={Link}
                                        to={`/organizer/events/${ev.id}/edit`}
                                        variant="outline-warning"
                                        size="sm"
                                    >
                                        Editar
                                    </Button>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(ev.id)}
                                        disabled={deletingId === ev.id}
                                    >
                                        {deletingId === ev.id ? "Eliminando..." : "Eliminar"}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default OrganizerEventsPage;
