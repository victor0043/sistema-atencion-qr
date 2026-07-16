import { useEffect, useState } from "react";

import appointmentService from "../../services/appointmentService";
import toast from "../../utils/toast";
import patientService from "../../services/patientService";
import medicalService from "../../services/medicalService";

import "./NuevaCitaModal.css";

function NuevaCitaModal({ cerrar, cita }) {

    const [pacientes, setPacientes] = useState([]);
    const [medicos, setMedicos] = useState([]);

    const [formulario, setFormulario] = useState({

        paciente_id: "",

        medico_id: "",

        fecha: "",

        hora: ""

    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Debe iniciar sesión para crear una nueva hora médica');
            cerrar();
            return;
        }

        cargarPacientes();
        cargarMedicos();

        if (cita) {
            setFormulario({
                paciente_id: cita.paciente?.id || "",
                medico_id: cita.medico?.id || "",
                fecha: (cita.fecha || "").split("T")[0] || "",
                hora: cita.hora || ""
            });
        }

    }, [cerrar, cita]);

    const cargarPacientes = async () => {

        try {

            const respuesta = await patientService.listar();

            setPacientes(respuesta.data || []);

            if (respuesta.error) {
                toast.error(respuesta.error);
            }

        }

        catch (error) {

            console.error('cargarPacientes error:', error);
            toast.error(error.response?.data?.mensaje || 'No fue posible cargar pacientes');
            setPacientes([]);

        }

    };

    const cargarMedicos = async () => {

        try {

            const respuesta = await medicalService.listar();

            setMedicos(respuesta.data || []);

            if (respuesta.error) {
                toast.error(respuesta.error);
            }

        }

        catch (error) {

            console.log(error);
            toast.error(error.response?.data?.mensaje || 'No fue posible cargar médicos');
            setMedicos([]);

        }

    };

    const cambiar = (e) => {

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
            if (!formulario.paciente_id || !formulario.medico_id || !formulario.fecha || !formulario.hora) {
                toast.error('Complete los campos obligatorios: Paciente, Médico, Fecha y Hora');
                setSaving(false);
                return;
            }

            console.log('Guardar cita payload:', formulario);
        let response;
        if (cita?.id) {
                response = await appointmentService.actualizar(cita.id, formulario);
                toast.success("Hora médica actualizada");
            } else {
                response = await appointmentService.crear(formulario);
                toast.success("Hora médica creada");
            }
        console.log('Guardar cita response:', response);

            cerrar();

        } catch (error) {

            console.error('Guardar hora error:', error);
            toast.error(error.response?.data?.mensaje || error.message || "Error al guardar la hora médica");

        } finally {
            setSaving(false);
        }

    };

    return (

        <div className="modal">

            <div className="modalContenido">

                <h2>

                    Nueva Hora Médica

                </h2>

                <form onSubmit={guardar}>

                    <label>

                        Paciente

                    </label>

                    <select

                        name="paciente_id"

                        value={formulario.paciente_id}

                        onChange={cambiar}

                    >

                        <option value="">

                            Seleccione

                        </option>

                        {

                            pacientes.map(paciente => (

                                <option

                                    key={paciente.id}

                                    value={paciente.id}

                                >

                                    {paciente.Usuario?.nombre || paciente.usuario?.nombre || paciente.Usuario?.rut || paciente.usuario?.rut || `Paciente ${paciente.id}`}

                                </option>

                            ))

                        }

                    </select>

                    <label>

                        Médico

                    </label>

                    <select

                        name="medico_id"

                        value={formulario.medico_id}

                        onChange={cambiar}

                    >

                        <option value="">

                            Seleccione

                        </option>

                        {

                            medicos.map(medico => (

                                <option

                                    key={medico.id}

                                    value={medico.id}

                                >

                                    {medico.Usuario?.nombre || medico.usuario?.nombre || medico.Usuario?.rut || medico.usuario?.rut || `Médico ${medico.id}`}

                                    {" - "}

                                    {medico.especialidad}

                                </option>

                            ))

                        }

                    </select>

                    <label>

                        Fecha

                    </label>

                    <input

                        type="date"

                        name="fecha"
                        onChange={cambiar}

                        value={formulario.fecha}

                        onChange={cambiar}

                    />

                    <label>

                        Hora

                    </label>

                    <input

                        type="time"

                        name="hora"
                        onChange={cambiar}

                        value={formulario.hora}

                        onChange={cambiar}

                    />

                    <div className="botones">

                        <button disabled={saving}>

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

export default NuevaCitaModal;