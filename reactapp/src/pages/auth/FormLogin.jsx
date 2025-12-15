import { useState } from "react";
import { Button, Card, Col, Container, Form, FormControl, FormGroup, FormLabel, Row } from "react-bootstrap";
import RequiredLabel from "../../components/RequiredLabel";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import useAuthentication from "../../hooks/useAuthentication";

const FormLogin = () => {
    const navigate = useNavigate();
    const { doLogin } = useAuthentication(false);

    const [validated, setValidated] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    const onDocenteSaveClick = (event) => {
        const form = event.currentTarget;
        let hasErrors = false;
        event.preventDefault();
        event.stopPropagation();
        if (form.checkValidity() === false) {
            hasErrors = true;
        }
        setValidated(true);

        if (hasErrors) {
            return;
        }
        sendLoginForm();
    }
    const sendLoginForm = () => {
        const loginData = {
            email,
            password,
        }
        doLogin(loginData);
    }

    const onCancelClick = () => {
        navigate("/");
    }
    return (
        <>
            <Container>
                <Row className="mt-2">
                    <Col md={6} xl={4}>
                        <Card>
                            <Card.Body>
                                <Form noValidate validated={validated} onSubmit={onDocenteSaveClick}>
                                    <Row>
                                        <Col>
                                            <h1>Iniciar sesión</h1>
                                            <FormGroup>
                                                <RequiredLabel htmlFor="txtEmail">Email</RequiredLabel>
                                                <FormControl id="txtEmail" required maxLength={100} type="text" value={email} onChange={(e) => {
                                                    setEmail(e.target.value);
                                                }} />
                                                <FormControl.Feedback type="invalid">El email es obligatorio</FormControl.Feedback>
                                            </FormGroup>
                                            <FormGroup>
                                                <RequiredLabel htmlFor="txtPassword">Password</RequiredLabel>
                                                <FormControl id="txtPassword" maxLength={100} required type="password" value={password} onChange={(e) => {
                                                    setPassword(e.target.value);
                                                }} />
                                                <FormControl.Feedback type="invalid">El password es obligatorio</FormControl.Feedback>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <div className="mt-2">
                                        <Button variant="primary" type="submit">Iniciar sesión</Button>
                                        <Button variant="secondary" className="ms-2" onClick={onCancelClick}>Cancelar</Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default FormLogin;