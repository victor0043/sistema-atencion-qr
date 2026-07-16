import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import medicalService from "../../services/medicalService";
import toast from "../../utils/toast";

import "./Medico.css";

function Medico() {
    const [pacientes, setPacientes] = useState([]);
    const [error, setError] = useState("");
    const [status, setStatus] = useState(null);
    const [cargando, setCargando] = useState(true);

    const cargar = async () => {
        setError("");
        setStatus(null);
        setCargando(true);
        try {
            const respuesta = await medicalService.obtenerPacientesHoy();
            setPacientes(
                Array.isArray(respuesta.data)
                    ? respuesta.data
                    : respuesta.data?.citas || []
            );
        } catch (error) {
            console.error("Medico load error:", error.response || error);
            const mensaje =
                error.response?.data?.mensaje ||
                error.message ||
                "No se pudieron cargar los pacientes del día.";
            setError(mensaje);
            setStatus(error.response?.status || null);
            toast.error("No se pudieron cargar los pacientes del día");
            setPacientes([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const iniciar = async (id) => {
        try {
            await medicalService.iniciarAtencion(id);
            toast.success("Atención iniciada");
            cargar();
        } catch (err) {
            toast.error("No fue posible iniciar la atención");
        }
    };

    const finalizar = async (id) => {
        try {
            await medicalService.finalizarAtencion(id);
            toast.success("Atención finalizada");
            cargar();
        } catch (err) {
            toast.error("No fue posible finalizar la atención");
        }
    };

    return (
        <DashboardLayout>
            <h1>Panel Médico</h1>

            {cargando ? (
                <p>Cargando pacientes...</p>
            ) : error ? (
                <div>
                    <p>Error: {error}</p>
                    {status === 401 && (
                        <p>Necesita iniciar sesión nuevamente o su sesión ha expirado.</p>
                    )}
                    <p>El administrador puede acceder a esta vista, pero el servicio de citas no devolvió datos.</p>
                </div>
            ) : pacientes.length === 0 ? (
                <p>No hay pacientes asignados para hoy.</p>
            ) : (
                <div className="cardsPacientes">
                    {pacientes.map((cita) => (
                        <div className="cardPaciente" key={cita.id}>
                            <h2>{cita.paciente?.usuario?.nombre || "Paciente no disponible"}</h2>
                            <p>Hora: {cita.hora || "--"}</p>
                            <p>Estado: {cita.estado || "--"}</p>
                            <p>Box: {cita.medico?.box || "--"}</p>

                            {cita.estado === "EN_ESPERA" && (
                                <button onClick={() => iniciar(cita.id)}>
                                    Iniciar Atención
                                </button>
                            )}

                            {cita.estado === "ATENDIENDO" && (
                                <button onClick={() => finalizar(cita.id)}>
                                    Finalizar Atención
                                </button>
                            )}

                            {cita.estado === "FINALIZADA" && (
                                <div className="terminado">Atención Finalizada</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

export default Medico;