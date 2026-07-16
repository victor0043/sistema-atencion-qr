import api from "../utils/axiosConfig";

const APPOINTMENT_URL = `${import.meta.env.VITE_APPOINTMENT_URL}/api/appointments`;
const ADMIN_URL = `${import.meta.env.VITE_ADMIN_URL}/api/admin`;

const listar = async () => {
    try {
        const response = await api.get(`${ADMIN_URL}/medicos`);
        return { data: response.data.medicos || [], raw: response.data };
    } catch (error) {
        return { data: [], error: error.response?.data?.mensaje || error.message, raw: error.response?.data };
    }
};

const obtenerPacientesHoy = async () => {
    const response = await api.get(APPOINTMENT_URL);
    return { data: response.data.citas || [] };
};

const iniciarAtencion = async (citaId) => {
    const response = await api.patch(`${APPOINTMENT_URL}/${citaId}/estado`, {
        estado: "ATENDIENDO"
    });
    return response.data;
};

const finalizarAtencion = async (citaId) => {
    const response = await api.patch(`${APPOINTMENT_URL}/${citaId}/estado`, {
        estado: "FINALIZADA"
    });
    return response.data;
};

export default {
    listar,
    obtenerPacientesHoy,
    iniciarAtencion,
    finalizarAtencion
};
