import api from "../utils/axiosConfig";

const URL = `${import.meta.env.VITE_AUTH_URL}/api/auth`;

const login = async (datos) => {

    const response = await api.post(`${URL}/login`, datos);

    return response.data;

};

export default {

    login

};