import { useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "../../utils/toast";

import authService from "../../services/authService";

import { guardarSesion } from "../../utils/auth";


import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [login, setLogin] = useState({
        rut: "",
        password: ""
    });

    const cambiar = (e) => {
        setLogin({
            ...login,
            [e.target.name]: e.target.value
        });
    };

    const ingresar = async (e) => {
        e.preventDefault();

        try {
            const respuesta = await authService.login(login);
            guardarSesion(respuesta);

            switch (respuesta.usuario.rol) {
                case "ADMIN":
                    navigate("/admin");
                    break;
                case "ADMINISTRATIVO":
                    navigate("/administrativo");
                    break;
                case "MEDICO":
                    navigate("/medico");
                    break;
                case "PACIENTE":
                    navigate("/paciente");
                    break;
                default:
                    navigate("/dashboard");
            }
        } catch (error) {
            toast.error(error.response?.data?.mensaje || "Credenciales Incorrectas");
        }
    };

    return (
        <div className="login-container">
            <div className="login-overlay" />
            <div className="login-right">
                <form onSubmit={ingresar} className="login-form">
                    <div className="login-header">
                        <h1>Hospital QR</h1>
                        <p>Sistema de Atención Inteligente</p>
                    </div>
                    <h2>Iniciar Sesión</h2>
                    <input
                        type="text"
                        name="rut"
                        placeholder="RUT"
                        value={login.rut}
                        onChange={cambiar}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={login.password}
                        onChange={cambiar}
                    />
                    <button type="submit">Ingresar</button>
                </form>
            </div>
        </div>
    );
}

export default Login;