// src/pages/events/EventsPublicPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { getAllEvents } from "../../services/EventsService";

const EventsPublicPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        getAllEvents()
            .then((data) => {
                setEvents(data);
            })
            .catch((err) => {
                console.error(err);
                setError("No se pudieron cargar los eventos.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const formatDateTime = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleString();
    };

    return (
        <Container className="mt-3">
            <h1 className="mb-3">Eventos disponibles</h1>

            {loading && (
                <div className="d-flex justify-content-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                </div>
            )}

            {error && (
                <Alert variant="danger">{error}</Alert>
            )}

            {!loading && !error && events.length === 0 && (
                <p>No hay eventos disponibles por ahora.</p>
            )}

            <Row>
                {events.map((event) => (
                    <Col key={event.id} md={6} lg={4} className="mb-3">
                        <Card>
                            {event.imagePath && (
                                <Card.Img
                                    variant="top"
                                    src={`http://localhost:3000${event.imagePath}`}
                                    alt={event.title}
                                />
                            )}
                            <Card.Body>
                                <Card.Title>{event.title}</Card.Title>
                                <Card.Text>
                                    <strong>Fecha y hora:</strong> {formatDateTime(event.dateTime)} <br />
                                    <strong>Lugar:</strong> {event.locationText} <br />
                                    <strong>Precio:</strong>{" "}
                                    {event.price && Number(event.price) > 0
                                        ? `Bs. ${Number(event.price).toFixed(2)}`
                                        : "Gratuito"}
                                    <br />
                                    <strong>Cupos máximos:</strong> {event.capacityMax}
                                </Card.Text>
                                <Button
                                    as={Link}
                                    to={`/events/${event.id}`}
                                    variant="primary"
                                >
                                    Ver detalles
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default EventsPublicPage;
