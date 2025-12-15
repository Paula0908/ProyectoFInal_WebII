// src/pages/events/EventDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Spinner,
    Alert,
    Form,
} from "react-bootstrap";
import { getEventById } from "../../services/EventsService";
import { registerToEvent } from "../../services/RegistrationsService";
import useAuthentication from "../../hooks/useAuthentication";
import QRCode from "react-qr-code";

const EventDetailPage = () => {
    const { id } = useParams();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { userRole } = useAuthentication(false);
    const [file, setFile] = useState(null);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerMessage, setRegisterMessage] = useState("");
    const [registerError, setRegisterError] = useState("");

    const [showBankQr, setShowBankQr] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError("");

        getEventById(id)
            .then(data => setEvent(data))
            .catch(err => {
                console.error(err);
                setError("No se pudo cargar el evento.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const formatDateTime = iso => {
        if (!iso) return "";
        return new Date(iso).toLocaleString();
    };

    const handleFileChange = e => {
        const f = e.target.files?.[0];
        setFile(f || null);
    };

    const handleRegisterSubmit = e => {
        e.preventDefault();
        setRegisterError("");
        setRegisterMessage("");

        setRegisterLoading(true);
        registerToEvent(event.id, file)
            .then(reg => {
                console.log("Registro creado", reg);
                setRegisterMessage("Solicitud de inscripción enviada correctamente.");
            })
            .catch(err => {
                console.error(err);
                const msg =
                    err?.response?.data?.message ||
                    "No se pudo completar la inscripción.";
                setRegisterError(Array.isArray(msg) ? msg.join(" ") : msg);
            })
            .finally(() => setRegisterLoading(false));
    };

    const handleToggleBankQr = () => setShowBankQr(prev => !prev);

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
                <Button as={Link} to="/" variant="secondary" className="mt-2">
                    Volver a eventos
                </Button>
            </Container>
        );
    }

    if (!event) {
        return (
            <Container className="mt-3">
                <Alert variant="warning">Evento no encontrado.</Alert>
                <Button as={Link} to="/" variant="secondary" className="mt-2">
                    Volver a eventos
                </Button>
            </Container>
        );
    }

    const hasLocation = event.latitude != null && event.longitude != null;
    const lat = hasLocation ? Number(event.latitude) : null;
    const lng = hasLocation ? Number(event.longitude) : null;
    const isFree = !event.price || Number(event.price) === 0;

    return (
        <Container className="mt-3">
            <Row>
                {/* IZQUIERDA: info, maps, inscribirse y volver */}
                <Col md={8}>
                    <h1>{event.title}</h1>
                    <p>{event.description}</p>

                    <p>
                        <strong>Fecha y hora:</strong>{" "}
                        {formatDateTime(event.dateTime)}
                        <br />
                        <strong>Lugar:</strong> {event.locationText}
                        <br />
                        <strong>Precio:</strong>{" "}
                        {!isFree
                            ? `Bs. ${Number(event.price).toFixed(2)}`
                            : "Gratuito"}
                        <br />
                        <strong>Cupos máximos:</strong> {event.capacityMax}
                    </p>

                    {event.createdBy && (
                        <p>
                            <strong>Organizador:</strong>{" "}
                            {event.createdBy.fullName || event.createdBy.email}
                        </p>
                    )}

                    {hasLocation && !Number.isNaN(lat) && !Number.isNaN(lng) && (
                        <div className="mt-3 mb-3">
                            <h5>Ubicación en el mapa</h5>
                            <div
                                style={{
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    height: "260px",
                                    boxShadow: "0 0 8px rgba(0, 0, 0, 0.15)",
                                }}
                            >
                                <iframe
                                    title="Mapa del evento"
                                    width="100%"
                                    height="260"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
                                    allowFullScreen
                                />
                            </div>

                            <div className="mt-2">
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Ver en Google Maps
                                </a>
                            </div>
                        </div>
                    )}

                    {userRole === "PARTICIPANT" && (
                        <Card className="mb-3">
                            <Card.Body>
                                <Card.Title>Inscribirme a este evento</Card.Title>

                                <p className="mb-2">
                                    {isFree ? (
                                        <>Este evento es gratuito. Puedes inscribirte directamente.</>
                                    ) : (
                                        <>
                                            Sube una imagen del comprobante de pago para
                                            que el organizador la revise.
                                        </>
                                    )}
                                </p>

                                {!isFree && (
                                    <div className="mb-3">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            type="button"
                                            onClick={handleToggleBankQr}
                                        >
                                            {showBankQr
                                                ? "Ocultar simulación de QR de banco"
                                                : "Simulación de QR de banco"}
                                        </Button>

                                        {showBankQr && (
                                            <div className="mt-2 d-flex flex-column align-items-center">
                                                <QRCode
                                                    value={`BANK_QR_EVENT_${event.id}`}
                                                    size={120}
                                                    style={{
                                                        height: "120px",
                                                        width: "120px",
                                                    }}
                                                />
                                                <small className="text-muted mt-1 text-center">
                                                    Simulación: aquí iría el QR generado por el banco.
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {registerError && (
                                    <Alert variant="danger" className="py-1">
                                        {registerError}
                                    </Alert>
                                )}
                                {registerMessage && (
                                    <Alert variant="success" className="py-1">
                                        {registerMessage}
                                    </Alert>
                                )}

                                <Form onSubmit={handleRegisterSubmit}>
                                    {!isFree && (
                                        <Form.Group
                                            controlId="paymentProof"
                                            className="mb-2"
                                        >
                                            <Form.Label>
                                                Comprobante de pago (imagen)
                                            </Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            <Form.Text className="text-muted">
                                                Formato: imagen (JPG, PNG, etc.). Tamaño
                                                máx: 10 MB.
                                            </Form.Text>
                                        </Form.Group>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={registerLoading}
                                    >
                                        {registerLoading
                                            ? "Enviando..."
                                            : "Enviar solicitud de inscripción"}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}

                    {userRole && userRole !== "PARTICIPANT" && (
                        <Alert variant="info" className="mt-3">
                            Solo los participantes pueden inscribirse a eventos.
                        </Alert>
                    )}

                    {!userRole && (
                        <Alert variant="info" className="mt-3">
                            Inicia sesión como participante para inscribirte a este
                            evento.
                        </Alert>
                    )}

                    <div className="mt-3 mb-5">
                        <Button as={Link} to="/" variant="secondary">
                            Volver a eventos
                        </Button>
                    </div>
                </Col>

                {/* DERECHA: imagen namas */}
                <Col md={4}>
                    {event.imagePath && (
                        <Card className="mb-3">
                            <Card.Img
                                variant="top"
                                src={`http://localhost:3000${event.imagePath}`}
                                alt={event.title}
                                style={{
                                    width: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default EventDetailPage;
