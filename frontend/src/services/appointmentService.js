import api from "../utils/axiosConfig";

// Base URL para el microservicio de citas (desde variables de entorno)
const URL = `${import.meta.env.VITE_APPOINTMENT_URL}/api/appointments`;

//==========================================
// LISTAR TODAS LAS CITAS
//==========================================
const listar = async () => {
    const response = await api.get(URL);
    return { data: response.data.citas };
};

//==========================================
// CREAR/AGENDAR NUEVA CITA MÉDICA
//==========================================
const crear = async (datos) => {
    console.log('appointmentService.crear', { url: URL, datos, token: localStorage.getItem('token') });
    const response = await api.post(URL, datos);
    console.log('appointmentService.crear response', response.data);
    return response.data;
};

//==========================================
// CONFIRMAR LLEGADA DEL PACIENTE (QR)
//==========================================
const confirmarLlegada = async (id) => {
    const response = await api.patch(`${URL}/${id}/estado`, {
        estado: "EN_ESPERA"
    });
    return response.data;
};

const confirmarPorCodigoQR = async (codigo) => {
    const response = await api.post(`${URL}/confirmar-qr`, {
        codigo_qr: codigo,
        cita_id: /^\d+$/.test(String(codigo || '')) ? Number(codigo) : null
    });
    return response.data;
};

//==========================================
// ACTUALIZAR CITA
//==========================================
const actualizar = async (id, datos) => {
    const response = await api.put(`${URL}/${id}`, datos);
    return response.data;
};

//==========================================
// ELIMINAR CITA
//==========================================
const eliminar = async (id) => {
    const response = await api.delete(`${URL}/${id}`);
    return response.data;
};

const listarPorPaciente = async (pacienteId) => {
    const response = await api.get(`${URL}/paciente/${pacienteId}`);
    return { data: response.data.citas || [] };
};

//==========================================
// OBTENER AGENDA MÉDICA DE HOY
//==========================================
const obtenerAgendaHoy = async () => {
    const response = await api.get(URL);
    return { data: response.data.citas };
};

const obtenerTrazabilidad = async () => {
    const response = await api.get(URL);
    return { data: response.data.citas };
};

export default {
    listar,
    crear,
    confirmarLlegada,
    confirmarPorCodigoQR,
    actualizar,
    eliminar,
    listarPorPaciente,
    obtenerAgendaHoy,
    obtenerTrazabilidad
};