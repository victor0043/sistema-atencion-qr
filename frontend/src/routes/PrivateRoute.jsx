import { Navigate } from "react-router-dom";

function PrivateRoute({ children, rol }) {

    const token = localStorage.getItem("token");

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!token) {

        return <Navigate to="/" />;

    }

    if (rol) {
        const permitido = Array.isArray(rol)
            ? rol.includes(usuario?.rol)
            : usuario?.rol === rol;

        if (!permitido) {
            return <Navigate to="/dashboard" />;
        }
    }

    return children;

}

export default PrivateRoute;