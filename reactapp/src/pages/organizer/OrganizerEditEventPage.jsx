import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    FormGroup,
    FormLabel,
    FormControl,
    Button,
    Spinner,
    Alert,
} from "react-bootstrap";
import { getEventById, updateEvent, uploadEventImage } from "../../services/EventsService";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

const isoToLocalDateTime = iso => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toISOString().slice(0, 16);
};

const MapClickHandler = ({ onChange }) => {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const ClickableMap = ({ lat, lng, onChange }) => {
    const defaultCenter = [-17.7833, -63.1833]; // SCZ :3
    const hasCoords = lat != null && lng != null;
    const center = hasCoords ? [lat, lng] : defaultCenter;

    return (
        <MapContainer
            center={center}
            zoom={15}
            style={{ height: 220, width: "100%", borderRadius: 8 }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onChange={onChange} />
            {hasCoords && <Marker position={[lat, lng]} />}
        </MapContainer>
    );
};

const OrganizerEditEventPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [locationText, setLocationText] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [capacityMax, setCapacityMax] = useState("");
    const [price, setPrice] = useState("");

    const [currentImage, setCurrentImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        getEventById(Number(eventId))
            .then(ev => {
                setTitle(ev.title || "");
                setDescription(ev.description || "");
                setDateTime(isoToLocalDateTime(ev.dateTime));
                setLocationText(ev.locationText || "");
                setLatitude(ev.latitude ?? "");
                setLongitude(ev.longitude ?? "");
                setCapacityMax(ev.capacityMax ?? "");
                setPrice(ev.price ?? 0);
                setCurrentImage(ev.imagePath || null);
            })
            .catch(err => {
                console.error(err);
                const msg =
                    err?.response?.data?.message || "No se pudo cargar el evento.";
                setError(Array.isArray(msg) ? msg.join(" ") : msg);
            })
            .finally(() => setLoading(false));
    }, [eventId]);

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const isoDateTime = dateTime ? new Date(dateTime).toISOString() : null;

            await updateEvent(Number(eventId), {
                title,
                description,
                dateTime: isoDateTime,
                locationText,
                latitude: latitude === "" ? null : Number(latitude),
                longitude: longitude === "" ? null : Number(longitude),
                capacityMax: capacityMax === "" ? null : Number(capacityMax),
                price: price === "" ? 0 : Number(price),
            });

            alert("Evento actualizado correctamente.");
            navigate("/organizer/events");
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message || "No se pudo actualizar el evento.";
            setError(Array.isArray(msg) ? msg.join(" ") : msg);
        } finally {
            setSaving(false);
        }
    };

    const handleImageFileChange = e => {
        const file = e.target.files?.[0];
        setSelectedImage(file || null);
    };

    const handleUploadImage = async () => {
        if (!selectedImage) return;
        setUploadingImage(true);
        setImageError("");

        try {
            const res = await uploadEventImage(Number(eventId), selectedImage);
            setCurrentImage(res.imagePath || null);
            alert("Imagen actualizada correctamente.");
            setSelectedImage(null);
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message || "No se pudo subir la imagen.";
            setImageError(Array.isArray(msg) ? msg.join(" ") : msg);
        } finally {
            setUploadingImage(false);
        }
    };

    const hasCoords = latitude !== "" && longitude !== "";
    const latNum = hasCoords ? Number(latitude) : null;
    const lngNum = hasCoords ? Number(longitude) : null;

    const handleMapChange = (lat, lng) => {

        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
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
            <Row>
                {/* IZQUIERDA: formulario */}
                <Col md={7}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2>Editar evento</h2>
                                <Button
                                    as={Link}
                                    to="/organizer/events"
                                    variant="secondary"
                                    size="sm"
                                >
                                    Volver
                                </Button>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <FormGroup className="mb-2">
                                    <FormLabel>Título</FormLabel>
                                    <FormControl
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup className="mb-2">
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl
                                        as="textarea"
                                        rows={3}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup className="mb-2">
                                    <FormLabel>Fecha y hora</FormLabel>
                                    <FormControl
                                        type="datetime-local"
                                        value={dateTime}
                                        onChange={e => setDateTime(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup className="mb-2">
                                    <FormLabel>Ubicación (texto)</FormLabel>
                                    <FormControl
                                        type="text"
                                        value={locationText}
                                        onChange={e => setLocationText(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <Row>
                                    <Col md={6}>
                                        <FormGroup className="mb-2">
                                            <FormLabel>Latitud</FormLabel>
                                            <FormControl
                                                type="number"
                                                step="0.000001"
                                                value={latitude}
                                                onChange={e => setLatitude(e.target.value)}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup className="mb-2">
                                            <FormLabel>Longitud</FormLabel>
                                            <FormControl
                                                type="number"
                                                step="0.000001"
                                                value={longitude}
                                                onChange={e => setLongitude(e.target.value)}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <FormGroup className="mb-2">
                                            <FormLabel>Cupos máximos</FormLabel>
                                            <FormControl
                                                type="number"
                                                min={1}
                                                value={capacityMax}
                                                onChange={e =>
                                                    setCapacityMax(e.target.value)
                                                }
                                                required
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup className="mb-2">
                                            <FormLabel>Precio (Bs)</FormLabel>
                                            <FormControl
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={price}
                                                onChange={e => setPrice(e.target.value)}
                                                required
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <div className="mt-3">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={saving}
                                    >
                                        {saving ? "Guardando..." : "Guardar cambios"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* DERECHA: imagen y maps */}
                <Col md={5} className="mt-3 mt-md-0">

                    <Card className="mb-3">
                        <Card.Body>
                            <h5 className="mb-2">Imagen del evento</h5>

                            {currentImage ? (
                                <div className="mb-2 text-center">
                                    <img
                                        src={`http://localhost:3000${currentImage}`}
                                        alt="Imagen del evento"
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: 220,
                                            objectFit: "cover",
                                            borderRadius: 8,
                                        }}
                                    />
                                </div>
                            ) : (
                                <p className="text-muted small mb-2">
                                    Este evento aún no tiene imagen.
                                </p>
                            )}

                            <FormGroup className="mb-2">
                                <FormLabel>Cambiar imagen</FormLabel>
                                <FormControl
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageFileChange}
                                />
                            </FormGroup>

                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={!selectedImage || uploadingImage}
                                onClick={handleUploadImage}
                            >
                                {uploadingImage ? "Subiendo..." : "Guardar imagen"}
                            </Button>

                            {imageError && (
                                <Alert variant="danger" className="mt-2">
                                    {imageError}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Body>
                            <h5 className="mb-2">Ubicación en mapa</h5>

                            <p className="text-muted small">
                                Haz click en el mapa para actualizar latitud y longitud.
                            </p>

                            <ClickableMap
                                lat={latNum}
                                lng={lngNum}
                                onChange={handleMapChange}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrganizerEditEventPage;
