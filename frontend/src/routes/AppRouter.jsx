import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Admin/Dashboard";
import Usuarios from "../pages/Admin/Usuarios";
import Administrativo from "../pages/Administrativo/Administrativo";
import Medico from "../pages/Medico/Medico";
import Paciente from "../pages/Paciente/Paciente";
import ConfirmarLlegadaPage from "../pages/Paciente/ConfirmarLlegadaPage";
import Trazabilidad from "../pages/Trazabilidad/Trazabilidad";

import PrivateRoute from "./PrivateRoute";

const renderRoute = (name, Component, props = {}) => {
    if (!Component) {
        console.error(`Route component ${name} is undefined`);
        return <div style={{ padding: 20, color: 'red' }}>Componente de ruta '{name}' no está definido.</div>;
    }
    return <Component {...props} />;
};

function AppRouter() {

    // Debug: log imported route components to detect undefined imports causing render errors
    console.log('Route components:', {
        Login: !!Login,
        Dashboard: !!Dashboard,
        Usuarios: !!Usuarios,
        Administrativo: !!Administrativo,
        Medico: !!Medico,
        Paciente: !!Paciente,
        Trazabilidad: !!Trazabilidad
    });

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/" element={renderRoute('Login', Login)} />

                <Route path="/confirmar-llegada/:codigo" element={renderRoute('ConfirmarLlegadaPage', ConfirmarLlegadaPage)} />

                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            {renderRoute('Dashboard', Dashboard)}
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <PrivateRoute rol="ADMIN">
                            {renderRoute('Dashboard', Dashboard)}
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/usuarios"
                    element={
                        <PrivateRoute rol="ADMIN">
                            {renderRoute('Usuarios', Usuarios)}
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/administrativo"
                    element={
                        <PrivateRoute rol={["ADMIN", "ADMINISTRATIVO"]}>
                            {renderRoute('Administrativo', Administrativo)}
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/medico"
                    element={
                        <PrivateRoute rol={["ADMIN", "MEDICO"]}>
                            {renderRoute('Medico', Medico)}
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/paciente"
                    element={
                        <PrivateRoute rol={["ADMIN", "ADMINISTRATIVO", "PACIENTE"]}>
                            {renderRoute('Paciente', Paciente)}
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/trazabilidad"
                    element={
                        <PrivateRoute rol={["ADMIN", "ADMINISTRATIVO", "PACIENTE"]}>
                            {renderRoute('Trazabilidad', Trazabilidad)}
                        </PrivateRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}

export default AppRouter;