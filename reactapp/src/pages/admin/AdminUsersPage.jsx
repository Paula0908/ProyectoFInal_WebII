// src/pages/admin/AdminUsersPage.jsx
import { useEffect, useState } from "react";
import {
    Container,
    Table,
    Spinner,
    Alert,
    Button,
    Modal,
    Form,
    FormGroup,
    FormLabel,
    FormControl,
    Row,
    Col,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
} from "../../services/UsersService";
import useAuthentication from "../../hooks/useAuthentication";

const AdminUsersPage = () => {
    useAuthentication(true);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editFullName, setEditFullName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editRoleName, setEditRoleName] = useState("PARTICIPANT");
    const [saving, setSaving] = useState(false);

    const loadUsers = () => {
        setLoading(true);
        setError("");

        getAllUsers()
            .then(data => setUsers(data))
            .catch(err => {
                console.error(err);
                const msg =
                    err?.response?.data?.message ||
                    "No se pudo cargar la lista de usuarios.";
                setError(Array.isArray(msg) ? msg.join(" ") : msg);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const openEditModal = user => {
        setEditingUser(user);
        setEditFullName(user.fullName || "");
        setEditEmail(user.email || "");
        setEditPassword("");
        setEditRoleName(user.role || "PARTICIPANT");
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingUser(null);
        setEditFullName("");
        setEditEmail("");
        setEditPassword("");
        setEditRoleName("PARTICIPANT");
    };

    const handleSaveEdit = async e => {
        e.preventDefault();
        if (!editingUser) return;

        setSaving(true);
        setError("");

        try {
            const payload = {
                fullName: editFullName,
                email: editEmail,
                roleName: editRoleName,
            };

            // solo mandar password si se escribio algo si no no:p
            if (editPassword.trim() !== "") {
                payload.password = editPassword;
            }

            await updateUserByAdmin(editingUser.id, payload);
            closeEditModal();
            loadUsers();
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                "No se pudo actualizar el usuario.";
            setError(Array.isArray(msg) ? msg.join(" ") : msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async user => {
        if (
            !window.confirm(
                `¿Seguro que deseas eliminar al usuario "${user.fullName}" (${user.email})?`,
            )
        ) {
            return;
        }

        setError("");

        try {
            await deleteUserByAdmin(user.id);
            loadUsers();
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                "No se pudo eliminar el usuario.";
            setError(Array.isArray(msg) ? msg.join(" ") : msg);
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

    return (
        <Container className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Usuarios (Admin)</h1>
                <Button as={Link} to="/admin/users/new" variant="primary">
                    Crear usuario
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {users.length === 0 ? (
                <Alert variant="info">No hay usuarios registrados.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre completo</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, idx) => (
                            <tr key={u.id}>
                                <td>{idx + 1}</td>
                                <td>{u.fullName}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="outline-warning"
                                        className="me-2"
                                        onClick={() => openEditModal(u)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleDelete(u)}
                                    >
                                        Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            
            <Modal show={showEditModal} onHide={closeEditModal}>
                <Form onSubmit={handleSaveEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Editar usuario</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col xs={12}>
                                <FormGroup className="mb-2">
                                    <FormLabel>Nombre completo</FormLabel>
                                    <FormControl
                                        type="text"
                                        value={editFullName}
                                        onChange={e => setEditFullName(e.target.value)}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12}>
                                <FormGroup className="mb-2">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl
                                        type="email"
                                        value={editEmail}
                                        onChange={e => setEditEmail(e.target.value)}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12}>
                                <FormGroup className="mb-2">
                                    <FormLabel>
                                        Nueva contraseña
                                        <span className="text-muted ms-1" style={{ fontSize: "0.85em" }}>
                                            (déjalo vacío para no cambiarla)
                                        </span>
                                    </FormLabel>
                                    <FormControl
                                        type="password"
                                        value={editPassword}
                                        onChange={e => setEditPassword(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12}>
                                <FormGroup className="mb-2">
                                    <FormLabel>Rol</FormLabel>
                                    <Form.Select
                                        value={editRoleName}
                                        onChange={e => setEditRoleName(e.target.value)}
                                        required
                                    >
                                        <option value="PARTICIPANT">PARTICIPANT</option>
                                        <option value="ORGANIZER">ORGANIZER</option>
                                        <option value="VALIDATOR">VALIDATOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </Form.Select>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeEditModal}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AdminUsersPage;
