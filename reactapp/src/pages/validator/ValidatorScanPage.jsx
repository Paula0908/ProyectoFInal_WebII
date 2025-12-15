// src/pages/validator/ValidatorScanPage.jsx
import { useEffect, useRef, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Alert,
    Form,
    FormControl,
    Button,
    FormCheck,
    Spinner,
} from "react-bootstrap";
import { Html5Qrcode } from "html5-qrcode";
import { validateQrToken } from "../../services/RegistrationsService";

const qrRegionId = "qr-reader-region";

const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    return d.toLocaleString("es-BO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

const formatErrorMessage = (msg) => {
    if (!msg) return "";

    const isoRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;

    const match = msg.match(isoRegex);
    if (!match) return msg;

    const pretty = formatDateTime(match[0]);
    return msg.replace(isoRegex, pretty);
};

const ValidatorScanPage = () => {
    const [useCamera, setUseCamera] = useState(true);
    const [cameraStatus, setCameraStatus] = useState("OFF"); // OFF | ON | ERROR | LOADING

    const [manualCode, setManualCode] = useState("");
    const [validating, setValidating] = useState(false);

    const [result, setResult] = useState(null); 

    const scannerRef = useRef(null);
    const lastScannedFromCameraRef = useRef(null);

    useEffect(() => {
        if (useCamera) {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useCamera]);

    const startScanner = async () => {
        try {
            setCameraStatus("LOADING");

            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(qrRegionId);
            }

            const devices = await Html5Qrcode.getCameras();
            if (!devices || devices.length === 0) {
                setCameraStatus("ERROR");
                setResult({
                    ok: false,
                    message: "No se encontró ninguna cámara disponible.",
                });
                return;
            }

            const cameraId = devices[0].id;

            await scannerRef.current.start(
                cameraId,
                {
                    fps: 5,
                    qrbox: 250,
                },
                (decodedText) => {
                    if (!decodedText) return;

                    if (lastScannedFromCameraRef.current === decodedText) {
                        return;
                    }
                    lastScannedFromCameraRef.current = decodedText;

                    stopScanner();

                    handleValidate(decodedText.trim());
                },
                () => {
                    // onScanFailure: se ignora y se sigue intentando
                }
            );

            setCameraStatus("ON");
        } catch (err) {
            console.error(err);
            setCameraStatus("ERROR");
            setResult({
                ok: false,
                message:
                    "No se pudo iniciar la cámara. Revisa permisos del navegador o intenta con otro dispositivo.",
            });
        }
    };

    const stopScanner = async () => {
        try {
            if (scannerRef.current) {
                await scannerRef.current.stop().catch(() => { });
                await scannerRef.current.clear().catch(() => { });
            }
        } catch {
            // se ignoran los errores al parar
        } finally {
            setCameraStatus("OFF");
        }
    };

    const handleValidate = async (code) => {
        if (!code) return;

        setValidating(true);
        setResult(null);

        try {
            const data = await validateQrToken(code);
            setResult({
                ok: true,
                message: "Ingreso válido. Check-in registrado correctamente.",
                data,
            });
        } catch (err) {
            console.error(err);
            const rawMsg =
                err?.response?.data?.message ||
                "Error al validar el código. Intenta nuevamente.";
            setResult({
                ok: false,
                message: formatErrorMessage(rawMsg),
            });
        } finally {
            setValidating(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        handleValidate(manualCode.trim());
    };

    const handleToggleCamera = () => {
        lastScannedFromCameraRef.current = null;
        setUseCamera((prev) => !prev);
    };

    return (
        <Container className="mt-3">
            <Row>
                {/* IZQUIERDA: camara e input manual */}
                <Col md={7} className="mb-3">
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <h3 className="mb-0">Validar entradas</h3>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <FormCheck
                                        type="switch"
                                        id="camera-switch"
                                        label={`Cámara: ${useCamera ? "ON" : "OFF"}`}
                                        checked={useCamera}
                                        onChange={handleToggleCamera}
                                    />
                                </div>
                            </div>

                            <p className="text-muted">
                                Apunta la cámara al código QR de la entrada. Al leerlo, se
                                mostrará si el ingreso es válido o no.
                            </p>

                            {/* Contenedor donde se inserta el video, facherito */}
                            <div
                                id={qrRegionId}
                                style={{
                                    width: "100%",
                                    maxWidth: "480px",
                                    margin: "0 auto 1rem",
                                    border: "1px solid #dee2e6",
                                    borderRadius: "8px",
                                    minHeight: "260px",
                                    display: useCamera ? "block" : "none",
                                }}
                            />

                            {cameraStatus === "LOADING" && useCamera && (
                                <div className="text-center text-muted mb-2">
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        className="me-2"
                                    />
                                    Iniciando cámara...
                                </div>
                            )}

                            {cameraStatus === "ERROR" && useCamera && (
                                <Alert variant="warning">
                                    No se pudo iniciar la cámara. Puedes ingresar el token
                                    manualmente más abajo.
                                </Alert>
                            )}

                            <hr />

                            <Form onSubmit={handleManualSubmit}>
                                <Form.Label>
                                    Si la cámara falla, puedes ingresar el código manualmente:
                                </Form.Label>
                                <div className="d-flex gap-2">
                                    <FormControl
                                        type="text"
                                        placeholder="Código QR / token"
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={validating || !manualCode.trim()}
                                    >
                                        {validating ? "Validando..." : "Validar"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* DERECHA: resultado */}
                <Col md={5}>
                    <Card>
                        <Card.Body>
                            <h3>Resultado</h3>

                            {!result && (
                                <p className="text-muted">
                                    Escanea un código o ingresa un token para ver el resultado.
                                </p>
                            )}

                            {result && result.ok && (
                                <Alert variant="success">
                                    <strong>Válido:</strong> {result.message}
                                    {result.data && (
                                        <div className="mt-2">
                                            <div>
                                                <strong>Participante:</strong>{" "}
                                                {result.data.participant?.fullName} (
                                                {result.data.participant?.email})
                                            </div>
                                            <div>
                                                <strong>Evento:</strong>{" "}
                                                {result.data.event?.title}
                                            </div>
                                            <div>
                                                <strong>Check-in:</strong>{" "}
                                                {formatDateTime(result.data.checkInAt)}
                                            </div>
                                        </div>
                                    )}
                                </Alert>
                            )}

                            {result && !result.ok && (
                                <Alert variant="danger">
                                    <strong>Inválido:</strong> {result.message}
                                </Alert>
                            )}

                            {result && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => {
                                        setResult(null);
                                        setManualCode("");
                                        // permitir volver a escanear :D
                                        if (useCamera) {
                                            lastScannedFromCameraRef.current = null;
                                            startScanner();
                                        }
                                    }}
                                >
                                    Escanear otro
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ValidatorScanPage;
