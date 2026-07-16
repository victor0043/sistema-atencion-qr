import axios from "axios";

const api = axios.create({

    headers:{

        "Content-Type":"application/json"

    }

});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        // Attach Bearer token
        config.headers.Authorization = 'Bearer ' + token;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            localStorage.clear();
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;
