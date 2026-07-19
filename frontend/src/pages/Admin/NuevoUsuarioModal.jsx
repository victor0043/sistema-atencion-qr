import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import toast from "../../utils/toast";

import "./NuevoUsuarioModal.css";

function NuevoUsuarioModal({ cerrar, usuario }) {

    const [formulario, setFormulario] = useState({

        rut: "",

        nombre: "",

        correo: "",

        password: "",

        rol_id: "",

        especialidad: "",

        box: "",

        cargo: ""

    });

    useEffect(() => {
        if (usuario) {
            setFormulario({
                rut: usuario.rut || "",
                nombre: usuario.nombre || "",
                correo: usuario.correo || "",
                password: "",
                rol_id: usuario.rol_id?.toString() || "",
                especialidad: usuario.especialidad || "",
                box: usuario.box || "",
                cargo: usuario.cargo || ""
            });
        }
    }, [usuario]);

    const [saving, setSaving] = useState(false);

    const cambiarValor = (e) => {

        setFormulario({

            ...formulario,

            [e.target.name]: e.target.value

        });

    };

    const guardar = async (e) => {

        e.preventDefault();

        if (saving) return;

        setSaving(true);

        try {

            // Validación cliente básica antes de enviar
            if (!usuario?.id) {
                if (!formulario.rut || !formulario.nombre || !formulario.password || !formulario.rol_id) {
                    toast.error("Complete los campos obligatorios (Rut, Nombre, Contraseña, Rol)");
                    setSaving(false);
                    return;
                }

                // Normalizar payload: enviar correo como null si está vacío para evitar conflictos de unicidad con ""
                const payload = { ...formulario };
                if (!payload.correo) payload.correo = null;
                // Asegurar que rol_id sea número
                payload.rol_id = Number(payload.rol_id) || null;

                // Normalizar RUT: eliminar puntos, guiones y espacios para evitar errores de longitud
                if (payload.rut) {
                    payload.rut = payload.rut.replace(/[.\-\s]/g, '');
                }

                console.log("Crear usuario - payload:", payload);

                // Comprobación cliente: evitar enviar correo o rut duplicados
                try {
                    const usuariosResp = await adminService.listarUsuarios();
                    const usuarios = usuariosResp.data || [];
                    const correoExistente = payload.correo && usuarios.some(u => u.correo === payload.correo);
                    const rutExistente = payload.rut && usuarios.some(u => u.rut === payload.rut);
                    if (correoExistente) {
                        toast.error('El correo ya está registrado');
                        setSaving(false);
                        return;
                    }
                    if (rutExistente) {
                        toast.error('El RUT ya está registrado');
                        setSaving(false);
                        return;
                    }
                } catch (err) {
                    console.warn('No fue posible validar duplicados cliente:', err);
                }

                await adminService.crearUsuario(payload);
                toast.success("Usuario creado correctamente");
            } else {
                const payload = { ...formulario };
                if (!payload.correo) payload.correo = null;
                payload.rol_id = Number(payload.rol_id) || null;

                console.log("Actualizar usuario - payload:", payload);
                await adminService.actualizarUsuario(usuario.id, payload);
                toast.success("Usuario actualizado correctamente");
            }

            cerrar();

        }

        catch(error){

            console.error("Crear/Actualizar usuario error:", error.response?.data || error.message);

            const msg = error.response?.data?.mensaje || "Error";

            if (typeof msg === 'string' && (msg.includes('llave duplicada') || msg.includes('duplicate key') || msg.includes('usuarios_correo_key') || msg.includes('usuarios_rut_key'))) {
                if (msg.includes('correo') || msg.includes('usuarios_correo_key')) {
                    toast.error('El correo ya está registrado');
                } else if (msg.includes('rut') || msg.includes('usuarios_rut_key')) {
                    toast.error('El RUT ya está registrado');
                } else {
                    toast.error('Ya existe un registro con esos datos');
                }
            } else {
                toast.error(msg);
            }

        } finally {
            setSaving(false);
        }

    };

    return(

<div className="modal">

<div className="contenido-modal">

<h2>

{usuario?.id ? "Editar Usuario" : "Nuevo Usuario"}

</h2>

<form onSubmit={guardar}>

<div className="form-grid">

<div className="campo">
<label>Rut</label>
<input
name="rut"
placeholder="Rut"
value={formulario.rut}
onChange={cambiarValor}
/>
</div>

<div className="campo">
<label>Nombre</label>
<input
name="nombre"
placeholder="Nombre"
value={formulario.nombre}
onChange={cambiarValor}
/>
</div>

<div className="campo">
<label>Correo</label>
<input
name="correo"
placeholder="Correo"
value={formulario.correo}
onChange={cambiarValor}
/>
</div>

<div className="campo">
<label>Contraseña</label>
<input
type="password"
name="password"
placeholder="Contraseña"
value={formulario.password}
onChange={cambiarValor}
/>
</div>

<div className="campo full-width">
<label>Rol</label>
<select
name="rol_id"
value={formulario.rol_id}
onChange={cambiarValor}
>
<option value="">Seleccione Rol</option>
<option value="1">Administrador</option>
<option value="2">Médico</option>
<option value="3">Administrativo</option>
<option value="4">Paciente</option>
</select>
</div>

{Number(formulario.rol_id)===2 &&
<>
<div className="campo">
<label>Especialidad</label>
<input
name="especialidad"
placeholder="Especialidad"
value={formulario.especialidad}
onChange={cambiarValor}
/
>
</div>

<div className="campo">
<label>Box</label>
<input
name="box"
placeholder="Box"
value={formulario.box}
onChange={cambiarValor}
/
>
</div>
</>
}

{Number(formulario.rol_id)===3 &&
<div className="campo full-width">
<label>Cargo</label>
<input
name="cargo"
placeholder="Cargo"
value={formulario.cargo}
onChange={cambiarValor}
/
>
</div>
}

</div>

<div className="botones">

<button
    type="submit"
    disabled={saving}
>
    {saving ? 'Guardando...' : 'Guardar'}
</button>

<button

type="button"

onClick={cerrar}

>

Cancelar

</button>

</div>

</form>

</div>

</div>

);

}

export default NuevoUsuarioModal;