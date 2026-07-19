import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";

import DashboardLayout from "../../layouts/DashboardLayout";

import adminService from "../../services/adminService";

import NuevoUsuarioModal from "./NuevoUsuarioModal";

import { cleanRut, formatRut } from "../../utils/rut";

import "./Usuarios.css";

function Usuarios() {

    const [usuarios, setUsuarios] = useState([]);

    const [busqueda, setBusqueda] = useState("");

    const [mostrarModal, setMostrarModal] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    const cargarUsuarios = async () => {

        try {

            const respuesta = await adminService.listarUsuarios();

            setUsuarios(respuesta.data);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        cargarUsuarios();

    }, []);

    const eliminar = async (id) => {

        if (!window.confirm("¿Eliminar usuario?")) return;

        await adminService.eliminarUsuario(id);

        cargarUsuarios();

    };

    const cambiarEstado = async (id) => {

        await adminService.cambiarEstado(id);

        cargarUsuarios();

    };

    const editarUsuario = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setMostrarModal(true);
    };

    const usuariosFiltrados = usuarios.filter((u) => {
        const busquedaLimpia = cleanRut(busqueda);
        return (
            (u.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
            cleanRut(u.rut).includes(busquedaLimpia)
        );
    });

    const nombreRol = (usuario) => {
        return usuario.rol?.nombre || usuario.Rol?.nombre || {
            1: "Administrador",
            2: "Medico",
            3: "Administrativo",
            4: "Paciente"
        }[usuario.rol_id] || "-";
    };

    return (

        <DashboardLayout>

            <div className="encabezado">

                <h2>Gestión de Usuarios</h2>

                <button

                    onClick={() => {
                        setUsuarioSeleccionado(null);
                        setMostrarModal(true);
                    }}

                >

                    + Nuevo Usuario

                </button>

            </div>

            <input

                className="busqueda"

                placeholder="Buscar por nombre o Rut"

                value={busqueda}

                onChange={(e) => setBusqueda(e.target.value)}

            />

            <div style={{ width: "100%", minHeight: 520, marginTop: "1rem" }}>
                <DataGrid
                        rows={usuariosFiltrados.map((usuario) => ({
                            id: usuario.id,
                            rut: formatRut(usuario.rut),
                            nombre: usuario.nombre,
                            correo: usuario.correo,
                            rol: nombreRol(usuario),
                            estado: usuario.activo ? "Activo" : "Inactivo",
                            usuario
                        }))}
                    columns={[
                        { field: "rut", headerName: "Rut", width: 160 },
                        { field: "nombre", headerName: "Nombre", width: 180, flex: 1 },
                        { field: "correo", headerName: "Correo", width: 220, flex: 1 },
                        { field: "rol", headerName: "Rol", width: 150 },
                        { field: "estado", headerName: "Estado", width: 120 },
                        {
                            field: "acciones",
                            headerName: "Acciones",
                            width: 250,
                            sortable: false,
                            filterable: false,
                            renderCell: (params) => (
                                <div className="acciones-botones">
                                    <button
                                        className="estado"
                                        onClick={() => cambiarEstado(params.row.usuario.id)}
                                    >
                                        Estado
                                    </button>
                                    <button
                                        className="editar"
                                        onClick={() => editarUsuario(params.row.usuario)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="eliminar"
                                        onClick={() => eliminar(params.row.usuario.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )
                        }
                    ]}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    disableSelectionOnClick
                    autoHeight
                    sx={{
                        backgroundColor: "#fff",
                        borderRadius: 3,
                        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
                        ".MuiDataGrid-columnHeaders": {
                            backgroundColor: "#e9f2ff",
                            color: "#102a5a",
                            fontWeight: 700
                        },
                        ".MuiDataGrid-cell": {
                            color: "#475569"
                        }
                    }}
                />
            </div>

            {

                mostrarModal &&

                <NuevoUsuarioModal

                    usuario={usuarioSeleccionado}

                    cerrar={() => {

                        setMostrarModal(false);

                        setUsuarioSeleccionado(null);

                        cargarUsuarios();

                    }}

                />

            }

        </DashboardLayout>

    );

}

export default Usuarios;