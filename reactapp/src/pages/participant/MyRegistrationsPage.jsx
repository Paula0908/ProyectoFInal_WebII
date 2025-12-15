// src/pages/registrations/MyRegistrationsPage.jsx
import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Badge,
    Button,
    Spinner,
    Alert,
    Modal,
    Form,
} from "react-bootstrap";
import {
    getMyRegistrations,
    updatePaymentProof,
    cancelRegistration,
} from "../../services/RegistrationsService";
import QRCode from "react-qr-code";

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

const MyRegistrationsPage = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [qrModalReg, setQrModalReg] = useState(null);

    const [fileByReg, setFileByReg] = useState({});
    const [loadingByReg, setLoadingByReg] = useState({});
    const [messageByReg, setMessageByReg] = useState({});
    const [errorByReg, setErrorByReg] = useState({});

    const loadRegistrations = () => {
        setLoading(true);
        setError("");

        getMyRegistrations()
            .then(data => setRegistrations(data))
            .catch(err => {
                console.error(err);
                setError("No se pudieron cargar tus inscripciones.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadRegistrations();
    }, []);

    const formatDateTime = iso => {
        if (!iso) return "";
        return new Date(iso).toLocaleString();
    };

    const handleFileChange = (regId, e) => {
        const file = e.target.files?.[0] || null;
        setFileByReg(prev => ({
            ...prev,
            [regId]: file,
        }));
    };

    const handleResendPaymentProof = reg => {
        const regId = reg.id;
        const file = fileByReg[regId];

        if (!file) {
            alert("Selecciona una imagen de comprobante antes de reenviar.");
            return;
        }

        setLoadingByReg(prev => ({ ...prev, [regId]: true }));
        setErrorByReg(prev => ({ ...prev, [regId]: "" }));
        setMessageByReg(prev => ({ ...prev, [regId]: "" }));

        updatePaymentProof(regId, file)
            .then(() => {
                setMessageByReg(prev => ({
                    ...prev,
                    [regId]:
                        "Comprobante actualizado. El organizador revisará nuevamente.",
                }));
                loadRegistrations();
            })
            .catch(err => {
                console.error(err);
                const msg =
                    err?.response?.data?.message ||
                    "No se pudo actualizar el comprobante.";
                setErrorByReg(prev => ({
                    ...prev,
                    [regId]: Array.isArray(msg) ? msg.join(" ") : msg,
                }));
            })
            .finally(() => {
                setLoadingByReg(prev => ({ ...prev, [regId]: false }));
            });
    };

    const handleCancelRegistration = reg => {
        const regId = reg.id;

        if (
            !window.confirm(
                "¿Seguro que deseas cancelar tu inscripción a este evento?",
            )
        ) {
            return;
        }

        setLoadingByReg(prev => ({ ...prev, [regId]: true }));
        setErrorByReg(prev => ({ ...prev, [regId]: "" }));
        setMessageByReg(prev => ({ ...prev, [regId]: "" }));

        cancelRegistration(regId)
            .then(() => {
                setMessageByReg(prev => ({
                    ...prev,
                    [regId]: "Inscripción cancelada correctamente.",
                }));
                loadRegistrations();
            })
            .catch(err => {
                console.error(err);
                const msg =
                    err?.response?.data?.message ||
                    "No se pudo cancelar la inscripción.";
                setErrorByReg(prev => ({
                    ...prev,
                    [regId]: Array.isArray(msg) ? msg.join(" ") : msg,
                }));
            })
            .finally(() => {
                setLoadingByReg(prev => ({ ...prev, [regId]: false }));
            });
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
            <h1>Mis inscripciones</h1>

            {registrations.length === 0 && (
                <Alert variant="info" className="mt-3">
                    Aún no tienes inscripciones a eventos.
                </Alert>
            )}

            <Row className="mt-3">
                {registrations.map(reg => {
                    const ev = reg.event;
                    const status = reg.status;

                    const price = ev?.price ? Number(ev.price) : 0;
                    const isFree = price === 0;
                    const hasProof = !!reg.paymentProofUrl;

                    const eventDate = ev?.dateTime ? new Date(ev.dateTime) : null;
                    const now = new Date();
                    const isFuture = eventDate ? eventDate > now : true;

                    const canCancel =
                        isFuture &&
                        status !== "USED" &&
                        (isFree ||
                            (price > 0 &&
                                (!hasProof || status === "REJECTED")));

                    return (
                        <Col md={6} lg={4} key={reg.id} className="mb-3">
                            <Card>
                                {ev?.imagePath && (
                                    <Card.Img
                                        variant="top"
                                        src={`http://localhost:3000${ev.imagePath}`}
                                        alt={ev.title}
                                        style={{
                                            maxHeight: "160px",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{ev?.title || "Evento"}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {formatDateTime(ev?.dateTime)}
                                    </Card.Subtitle>

                                    <p className="mb-1">
                                        <strong>Estado:</strong>{" "}
                                        <Badge bg={statusVariant(status)}>
                                            {status}
                                        </Badge>
                                    </p>

                                    {ev?.locationText && (
                                        <p className="mb-1">
                                            <strong>Lugar:</strong> {ev.locationText}
                                        </p>
                                    )}

                                    {status === "ACCEPTED" && reg.qrToken && (
                                        <div className="mt-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => setQrModalReg(reg)}
                                            >
                                                Ver QR de entrada
                                            </Button>
                                        </div>
                                    )}

                                    {status === "REJECTED" && (
                                        <div className="mt-3">
                                            <small className="text-danger d-block mb-1">
                                                Tu comprobante fue rechazado. Puedes subir
                                                uno nuevo.
                                            </small>

                                            <Form.Group
                                                controlId={`paymentProof-${reg.id}`}
                                                className="mb-2"
                                            >
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    size="sm"
                                                    onChange={e =>
                                                        handleFileChange(reg.id, e)
                                                    }
                                                />
                                            </Form.Group>

                                            {errorByReg[reg.id] && (
                                                <Alert
                                                    variant="danger"
                                                    className="py-1 mt-1"
                                                >
                                                    {errorByReg[reg.id]}
                                                </Alert>
                                            )}

                                            {messageByReg[reg.id] && (
                                                <Alert
                                                    variant="success"
                                                    className="py-1 mt-1"
                                                >
                                                    {messageByReg[reg.id]}
                                                </Alert>
                                            )}

                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                disabled={!!loadingByReg[reg.id]}
                                                onClick={() =>
                                                    handleResendPaymentProof(reg)
                                                }
                                            >
                                                {loadingByReg[reg.id]
                                                    ? "Enviando..."
                                                    : "Reenviar comprobante"}
                                            </Button>
                                        </div>
                                    )}

                                    {canCancel && (
                                        <div className="mt-3">
                                            {errorByReg[reg.id] && (
                                                <Alert
                                                    variant="danger"
                                                    className="py-1 mt-1"
                                                >
                                                    {errorByReg[reg.id]}
                                                </Alert>
                                            )}

                                            {messageByReg[reg.id] && (
                                                <Alert
                                                    variant="success"
                                                    className="py-1 mt-1"
                                                >
                                                    {messageByReg[reg.id]}
                                                </Alert>
                                            )}

                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                disabled={!!loadingByReg[reg.id]}
                                                onClick={() =>
                                                    handleCancelRegistration(reg)
                                                }
                                            >
                                                {loadingByReg[reg.id]
                                                    ? "Cancelando..."
                                                    : "Cancelar inscripción"}
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            <Modal
                show={!!qrModalReg}
                onHide={() => setQrModalReg(null)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>QR de entrada</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex flex-column align-items-center">
                    {qrModalReg && qrModalReg.qrToken ? (
                        <>
                            <QRCode
                                value={qrModalReg.qrToken}
                                size={180}
                                style={{ height: "180px", width: "180px" }}
                            />
                            <p className="mt-3 text-center">
                                Muestra este código en la entrada del evento para que el
                                validador lo escanee.
                            </p>
                        </>
                    ) : (
                        <p>No hay QR disponible para esta inscripción.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setQrModalReg(null)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default MyRegistrationsPage;
