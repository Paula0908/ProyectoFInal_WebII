// src/pages/admin/AdminNewUserPage.jsx
import { useState } from "react";
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
    Alert,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { createUserByAdmin } from "../../services/UsersService";
import useAuthentication from "../../hooks/useAuthentication";

const AdminNewUserPage = () => {
    useAuthentication(true);

    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleName, setRoleName] = useState("PARTICIPANT");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await createUserByAdmin({
                fullName,
                email,
                password,
                roleName,
            });

            alert("Usuario creado correctamente.");
            navigate("/admin/users");
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message || "No se pudo crear el usuario.";
            setError(Array.isArray(msg) ? msg.join(" ") : msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container className="mt-3">
            <Row className="justify-content-center">
                <Col md={6} lg={5}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2>Crear usuario (Admin)</h2>
                                <Button
                                    as={Link}
                                    to="/admin/users"
                                    variant="secondary"
                                    size="sm"
                                >
                                    Volver
                                </Button>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <FormGroup className="mb-2">
                                    <FormLabel>Nombre completo</FormLabel>
                                    <FormControl
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup className="mb-2">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup className="mb-2">
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup className="mb-3">
                                    <FormLabel>Rol</FormLabel>
                                    <Form.Select
                                        value={roleName}
                                        onChange={e => setRoleName(e.target.value)}
                                        required
                                    >
                                        <option value="PARTICIPANT">PARTICIPANT</option>
                                        <option value="ORGANIZER">ORGANIZER</option>
                                        <option value="VALIDATOR">VALIDATOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </Form.Select>
                                </FormGroup>

                                <div className="mt-2">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={saving}
                                    >
                                        {saving ? "Guardando..." : "Crear usuario"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminNewUserPage;
