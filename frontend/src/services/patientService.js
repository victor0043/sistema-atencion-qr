import api from "../utils/axiosConfig";
import appointmentService from "./appointmentService";

const URL = `${import.meta.env.VITE_PATIENT_URL}/api/patients`;

const listar = async () => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('patientService.listar: no token en localStorage');
            return { data: [], error: 'Token ausente. Inicie sesión.' };
        }

        console.log('patientService.listar', {
            url: URL,
            tokenPresent: !!token
        });

        const response = await api.get(URL);
        return { data: response.data.pacientes || [], raw: response.data };
    } catch (error) {
        console.warn('patientService.listar error:', error.response || error.message);
        return { data: [], error: error.response?.data?.mensaje || error.message, raw: error.response?.data };
    }
};

const normalizePaciente = (paciente) => {
    if (!paciente) return paciente;

    if (paciente.Usuario && !paciente.usuario) {
        paciente.usuario = paciente.Usuario;
    }

    return paciente;
};

const normalizeCita = (cita) => {
    if (!cita) return cita;

    if (cita.medico?.Usuario && !cita.medico.usuario) {
        cita.medico.usuario = cita.medico.Usuario;
    }

    if (cita.paciente?.Usuario && !cita.paciente.usuario) {
        cita.paciente.usuario = cita.paciente.Usuario;
    }

    return cita;
};

const perfil = async () => {
    try {
        const response = await api.get(`${URL}/me`);
        const paciente = normalizePaciente(response.data.paciente || response.data);

        if (paciente?.id) {
            try {
                const citaResponse = await appointmentService.listarPorPaciente(paciente.id);
                paciente.cita = normalizeCita((citaResponse?.data || [])[0] || null);
            } catch (citaError) {
                console.warn('patientService.perfil cita error:', citaError.response?.data || citaError.message);
                paciente.cita = null;
            }
        }

        return { data: paciente || null, error: null };
    } catch (error) {
        const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "null");

        if (usuarioGuardado) {
            return {
                data: {
                    usuario: usuarioGuardado,
                    cita: null
                },
                error: null
            };
        }

        console.error('patientService.perfil error:', error.response?.data || error.message);
        return { data: null, error: error.response?.data?.mensaje || error.message };
    }
};

const actualizar = async (datos, pacienteId = null) => {
    let id = pacienteId;
    if (!id) {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        id = usuario?.id;
    }
    const response = await api.put(`${URL}/${id}`, datos);
    return response.data;
};

const confirmarQR = async (id) => {
    const response = await api.patch(`${import.meta.env.VITE_APPOINTMENT_URL}/api/appointments/${id}/estado`, {
        estado: "EN_ESPERA"
    });
    return response.data;
};

export default {
    listar,
    perfil,
    actualizar,
    confirmarQR
};