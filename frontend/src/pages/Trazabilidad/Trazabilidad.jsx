import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import appointmentService from "../../services/appointmentService";
import patientService from "../../services/patientService";
import { formatRut } from "../../utils/rut";

import "./Trazabilidad.css";

function Trazabilidad(){

const navigate = useNavigate();
const[citas,setCitas]=useState([]);
const[vistaCards, setVistaCards] = useState(true);

const cargar=async()=>{

    try{

        const usuario = JSON.parse(localStorage.getItem("usuario"));

        if (usuario?.rol === "PACIENTE") {
            // Para pacientes, solicitar solo sus citas
            const perfilResp = await patientService.perfil();
            const paciente = perfilResp.data;

            if (paciente?.id) {
                const respuesta = await appointmentService.listarPorPaciente(paciente.id);
                setCitas(respuesta.data || []);
            } else {
                setCitas([]);
            }
        } else {
            const respuesta = await appointmentService.obtenerTrazabilidad();
            setCitas(respuesta.data || []);
        }

    }
    catch(error){

        console.log(error);

    }

};

useEffect(()=>{

cargar();

const intervalo=setInterval(cargar,10000);

return()=>clearInterval(intervalo);

},[]);

const colorEstado=(estado)=>{

switch(estado){

case "AGENDADA":

return "gris";

case "EN_ESPERA":

return "amarillo";

case "ATENDIENDO":

return "azul";

case "FINALIZADA":

return "verde";

default:

return "";

}

}

const getEstadoIcon = (estado) => {
    switch(estado){
        case "AGENDADA": return "📋";
        case "EN_ESPERA": return "⏳";
        case "ATENDIENDO": return "👨‍⚕️";
        case "FINALIZADA": return "✅";
        default: return "❓";
    }
}

return(

<div className="pantalla">

<h1>Hospital QR</h1>

<h2>Estado de Atención de Pacientes</h2>

<div className="controles-trazabilidad">
    <button 
        className={`btn-vista ${vistaCards ? 'activo' : ''}`}
        onClick={() => setVistaCards(true)}>
        🎴 Vista Cards
    </button>
    <button 
        className={`btn-vista ${!vistaCards ? 'activo' : ''}`}
        onClick={() => setVistaCards(false)}>
        📊 Vista Tabla
    </button>
    <button 
        className="btn-vista btn-volver"
        onClick={() => {
            const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
            const rol = usuario.rol;

            if (rol === 'ADMIN') {
                navigate('/admin');
            } else if (rol === 'ADMINISTRATIVO') {
                navigate('/administrativo');
            } else if (rol === 'MEDICO') {
                navigate('/medico');
            } else if (rol === 'PACIENTE') {
                navigate('/paciente');
            } else {
                navigate('/dashboard');
            }
        }}>
        🔙 Volver al Menú
    </button>
</div>

{vistaCards ? (
    <div className="cards-container">
        {citas.map(cita => (
            <div key={cita.id} className={`card-cita card-estado-${cita.estado}`}>
                <div className="card-header">
                    <div className="estado-badge">
                        <span className={`estado-icon ${colorEstado(cita.estado)}`}>
                            {getEstadoIcon(cita.estado)}
                        </span>
                        <span className={`estado-text ${colorEstado(cita.estado)}`}>
                            {cita.estado}
                        </span>
                    </div>
                    <div className="card-hora">
                        <span className="hora-label">⏰ {cita.hora}</span>
                    </div>
                </div>

                <div className="card-content">
                    <div className="info-row">
                        <span className="label">👤 Paciente:</span>
                        <span className="valor">{cita.paciente?.usuario?.nombre || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">🆔 RUT:</span>
                        <span className="valor">{cita.paciente?.usuario?.rut ? formatRut(cita.paciente.usuario.rut) : '-'}</span>
                    </div>

                    <div className="separator"></div>

                    <div className="info-row">
                        <span className="label">👨‍⚕️ Médico:</span>
                        <span className="valor">{cita.medico?.usuario?.nombre || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">🏥 Especialidad:</span>
                        <span className="valor">{cita.medico?.especialidad || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">📍 Box:</span>
                        <span className="valor box-number">{cita.medico?.box || '-'}</span>
                    </div>

                    <div className="separator"></div>

                    <div className="info-row">
                        <span className="label">📅 Fecha:</span>
                        <span className="valor">{cita.fecha || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">🔐 Código QR:</span>
                        <span className="valor qr-code">{cita.codigo_qr?.substring(0, 12) || '-'}...</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
) : (
    <table className="tabla-mejorada">
        <thead>
            <tr>
                <th>Estado</th>
                <th>Hora</th>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>RUT</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Box</th>
            </tr>
        </thead>
        <tbody>
            {citas.map(cita => (
                <tr key={cita.id} className={`fila-${cita.estado}`}>
                    <td>
                        <span className={`badge-estado ${colorEstado(cita.estado)}`}>
                            <span className="badge-icon">{getEstadoIcon(cita.estado)}</span>
                            <span className="badge-text">{cita.estado}</span>
                        </span>
                    </td>
                    <td className="celda-hora">{cita.hora}</td>
                    <td className="celda-fecha">{cita.fecha}</td>
                    <td className="celda-paciente">{cita.paciente?.usuario?.nombre}</td>
                    <td className="celda-rut">{cita.paciente?.usuario?.rut ? formatRut(cita.paciente.usuario.rut) : ''}</td>
                    <td className="celda-medico">{cita.medico?.usuario?.nombre}</td>
                    <td className="celda-especialidad">{cita.medico?.especialidad}</td>
                    <td className="celda-box">
                        <span className="box-badge">{cita.medico?.box}</span>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
)}

</div>

);

}

export default Trazabilidad;