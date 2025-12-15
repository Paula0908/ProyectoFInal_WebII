// src/hooks/useAuthentication.js
import { useNavigate } from "react-router-dom";
import { getAccessToken, removeAccessToken, saveAccessToken } from "../../utils/TokenUtilities";
import { useEffect } from "react";
import { login } from "../services/AuthService";

const useAuthentication = (checkOnload = false) => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail") || "";
    const userRole = localStorage.getItem("userRole") || "";

    const validateLogin = () => {
        const token = getAccessToken();
        if (!token) {
            navigate("/login");
            return;
        }
    };

    const doLogin = (loginData) => {
        login(loginData)
            .then((response) => {
                saveAccessToken(response.access_token);
                localStorage.setItem("userEmail", response.user?.email || loginData.email);
                localStorage.setItem("userRole", response.user?.role || "");
                navigate("/");
            })
            .catch(() => {
                alert("Error al iniciar sesión");
            });
    };

    const doLogout = () => {
        removeAccessToken();
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        navigate("/login");
    };

    useEffect(() => {
        if (!checkOnload) {
            return;
        }
        validateLogin();
        // eslint-disable-next-line
    }, [navigate]);

    return { doLogout, doLogin, userEmail, userRole };
};

export default useAuthentication;
