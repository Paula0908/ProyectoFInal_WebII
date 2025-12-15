// src/components/Header.jsx
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAccessToken } from "../../utils/TokenUtilities";
import useAuthentication from "../hooks/useAuthentication";

const Header = () => {
    const { doLogout, userEmail, userRole } = useAuthentication();
    const token = getAccessToken();

    const onLogoutClick = () => {
        doLogout();
    };

    return (
        <Navbar bg="primary" data-bs-theme="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    EventQR
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-navbar" />

                <Navbar.Collapse id="main-navbar">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">
                            Eventos
                        </Nav.Link>

                        {token ? (
                            <>
                                {/* PARTICIPANT */}
                                {userRole === "PARTICIPANT" && (
                                    <NavDropdown title="Participante" id="participant-nav">
                                        <Link className="dropdown-item" to="/me/registrations">
                                            Mis inscripciones
                                        </Link>
                                    </NavDropdown>
                                )}

                                {/* ORGANIZER */}
                                {userRole === "ORGANIZER" && (
                                    <NavDropdown title="Organizador" id="organizer-nav">
                                        <Link className="dropdown-item" to="/organizer/events">
                                            Mis eventos
                                        </Link>
                                        <Link className="dropdown-item" to="/organizer/events/new">
                                            Crear evento
                                        </Link>
                                        <Link className="dropdown-item" to="/organizer/reports">
                                            Reportes
                                        </Link>
                                    </NavDropdown>
                                )}


                                {/* VALIDATOR */}
                                {userRole === "VALIDATOR" && (
                                    <NavDropdown title="Validador" id="validator-nav">
                                        <Link className="dropdown-item" to="/validator/scan">
                                            Validar QR
                                        </Link>
                                    </NavDropdown>
                                )}

                                {/* ADMIN */}
                                {userRole === "ADMIN" && (
                                    <NavDropdown title="Admin" id="admin-nav">
                                        <Link className="dropdown-item" to="/admin/users">
                                            Usuarios
                                        </Link>
                                        <Link className="dropdown-item" to="/admin/users/new">
                                            Crear usuario
                                        </Link>
                                    </NavDropdown>
                                )}

                                {/* Cuenta / Logout */}
                                <NavDropdown
                                    title={userEmail || "Mi cuenta"}
                                    id="logout-dropdown"
                                    align="end"
                                >
                                    <button
                                        className="dropdown-item"
                                        type="button"
                                        onClick={onLogoutClick}
                                    >
                                        Cerrar sesión
                                    </button>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">
                                    Iniciar sesión
                                </Nav.Link>
                                <Nav.Link as={Link} to="/register">
                                    Registrarse
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
