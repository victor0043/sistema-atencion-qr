import api from "../utils/axiosConfig";

const URL = `${import.meta.env.VITE_ADMIN_URL}/api/admin`;

const listarUsuarios = async () => {
    const response = await api.get(`${URL}/usuarios`);
    return { data: response.data.usuarios };
};

const crearUsuario = async (datos) => {
    try {
        console.log("POST", `${URL}/usuarios`, datos);
        const response = await api.post(`${URL}/usuarios`, datos);
        console.log("POST response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating usuario:", error.response?.data || error.message);
        throw error;
    }
};

const eliminarUsuario = async (id) => {
    const response = await api.delete(`${URL}/usuarios/${id}`);
    return response.data;
};

const cambiarEstado = async (id) => {
    const response = await api.patch(`${URL}/usuarios/${id}/estado`);
    return response.data;
};

const actualizarUsuario = async (id, datos) => {
    const response = await api.put(`${URL}/usuarios/${id}`, datos);
    return response.data;
};

export default {
    listarUsuarios,
    crearUsuario,
    eliminarUsuario,
    cambiarEstado,
    actualizarUsuario
};
