export const guardarSesion = (datos) => {

    localStorage.setItem("token", datos.token);

    localStorage.setItem("usuario", JSON.stringify(datos.usuario));

    if (datos.usuario?.rol) {
        localStorage.setItem("rol", datos.usuario.rol);
    }

};

export const obtenerUsuario = () => {

    return JSON.parse(localStorage.getItem("usuario"));

};

export const obtenerToken = () => {

    return localStorage.getItem("token");

};

export const cerrarSesion = () => {

    localStorage.clear();

};