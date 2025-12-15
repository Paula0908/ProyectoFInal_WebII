// src/pages/organizer/OrganizerReportsPage.jsx
import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    FormGroup,
    FormLabel,
    FormSelect,
    Spinner,
    Alert,
    ListGroup,
} from "react-bootstrap";
import { getMyEvents, getEventStats } from "../../services/EventsService";

const formatDateTime = iso => {
    if (!iso) return "";
    return new Date(iso).toLocaleString();
};

const OrganizerReportsPage = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [stats, setStats] = useState(null);

    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingStats, setLoadingStats] = useState(false);
    const [errorEvents, setErrorEvents] = useState("");
    const [errorStats, setErrorStats] = useState("");


    useEffect(() => {
        setLoadingEvents(true);
        setErrorEvents("");

        getMyEvents()
            .then(data => {
                setEvents(data || []);
                if (data && data.length > 0) {
                    setSelectedEventId(String(data[0].id));
                }
            })
            .catch(err => {
                console.error(err);
                setErrorEvents("No se pudieron cargar tus eventos.");
            })
            .finally(() => setLoadingEvents(false));
    }, []);

    useEffect(() => {
        if (!selectedEventId) {
            setStats(null);
            return;
        }

        setLoadingStats(true);
        setErrorStats("");
        setStats(null);

        getEventStats(Number(selectedEventId))
            .then(data => {
                setStats(data);
            })
            .catch(err => {
                console.error(err);
                const msg =
                    err?.response?.data?.message ||
                    "No se pudieron cargar las estadísticas.";
                setErrorStats(Array.isArray(msg) ? msg.join(" ") : msg);
            })
            .finally(() => setLoadingStats(false));
    }, [selectedEventId]);

    const occupancyPercent =
        stats && stats.capacityMax > 0
            ? Math.round((stats.accepted / stats.capacityMax) * 100)
            : 0;

    return (
        <Container className="mt-3">
            <Row>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <h2 className="h5 mb-3">Reportes de eventos</h2>

                            {errorEvents && (
                                <Alert variant="danger">{errorEvents}</Alert>
                            )}

                            {loadingEvents ? (
                                <div className="d-flex justify-content-center my-3">
                                    <Spinner animation="border" size="sm" />
                                </div>
                            ) : events.length === 0 ? (
                                <Alert variant="info">
                                    Aún no has creado eventos para mostrar reportes.
                                </Alert>
                            ) : (
                                <Form>
                                    <FormGroup className="mb-2">
                                        <FormLabel>Selecciona un evento</FormLabel>
                                        <FormSelect
                                            value={selectedEventId}
                                            onChange={e =>
                                                setSelectedEventId(e.target.value)
                                            }
                                        >
                                            {events.map(ev => (
                                                <option key={ev.id} value={ev.id}>
                                                    {ev.title}
                                                </option>
                                            ))}
                                        </FormSelect>
                                    </FormGroup>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>


                <Col md={8} className="mt-3 mt-md-0">
                    <Card>
                        <Card.Body>
                            <h2 className="h5 mb-3">Estadísticas del evento</h2>

                            {errorStats && (
                                <Alert variant="danger">{errorStats}</Alert>
                            )}

                            {loadingStats ? (
                                <div className="d-flex justify-content-center my-4">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">
                                            Cargando...
                                        </span>
                                    </Spinner>
                                </div>
                            ) : !stats ? (
                                <p className="text-muted">
                                    Selecciona un evento para ver sus estadísticas.
                                </p>
                            ) : (
                                <ListGroup>
                                    <ListGroup.Item>
                                        <strong>Evento:</strong> {stats.title}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Fecha y hora:</strong>{" "}
                                        {formatDateTime(stats.dateTime)}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Cupos máximos:</strong>{" "}
                                        {stats.capacityMax}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Total inscripciones:</strong>{" "}
                                        {stats.totalRegistrations}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Pendientes:</strong>{" "}
                                        {stats.pending}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Aceptadas:</strong>{" "}
                                        {stats.accepted}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Rechazadas:</strong>{" "}
                                        {stats.rejected}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Con check-in (QR usado):</strong>{" "}
                                        {stats.checkedIn}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Cupos libres:</strong>{" "}
                                        {stats.freeSlots}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Ocupación:</strong>{" "}
                                        {occupancyPercent}%
                                    </ListGroup.Item>
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrganizerReportsPage;
