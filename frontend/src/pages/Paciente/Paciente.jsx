import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatRut } from "../../utils/rut";

import DashboardLayout from "../../layouts/DashboardLayout";

import patientService from "../../services/patientService";
import appointmentService from "../../services/appointmentService";

import ActualizarDatosModal from "./ActualizarDatosModal";

import toast from "../../utils/toast";

import "./Paciente.css";

function Paciente(){

const [paciente, setPaciente] = useState(null);
const [citas, setCitas] = useState([]);
const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);
const [mostrar, setMostrar] = useState(false);
const [qrVisible, setQrVisible] = useState(false);
const [qrValue, setQrValue] = useState(null);
const [filtro, setFiltro] = useState("");

const usuario = JSON.parse(localStorage.getItem("usuario"));
const esAdmin = usuario?.rol === "ADMIN" || usuario?.rol === "ADMINISTRATIVO";

// Modal del QR: se define una sola vez y se incluye en cualquier rama que lo
// dispare (vista admin de la tabla o vista individual del paciente), en vez
// de vivir solo en el JSX de una de las dos, donde la otra rama nunca lo alcanza.
const qrModal = qrVisible && (
  <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000}} onClick={() => setQrVisible(false)}>
    <div style={{background: 'white', padding: 20, borderRadius: 12, minWidth: 280}} onClick={(e) => e.stopPropagation()}>
        <h3 style={{marginTop:0}}>QR de Confirmación</h3>
        {qrValue ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <QRCodeSVG value={qrValue} size={220} level="H" />
                <p style={{fontSize: 12, color: '#374151', marginTop: 8, textAlign: 'center'}}>{qrValue}</p>
            </div>
        ) : (
            <p>No hay código disponible para esta cita.</p>
        )}
        <div style={{marginTop: 12}}>
            <button onClick={() => setQrVisible(false)} style={{padding: '8px 12px', borderRadius: 6, border: 'none', background: '#1565c0', color: 'white', cursor: 'pointer'}}>Cerrar</button>
        </div>
    </div>
  </div>
);

const cargar = async () => {
    setLoading(true);
    setError(null);

    if (esAdmin) {
        // Admin: cargar todas las citas del día
        try {
            const respuesta = await appointmentService.obtenerAgendaHoy();
            setCitas(respuesta.data || []);
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al cargar citas");
        }
    } else {
        // Paciente: cargar su perfil
        const respuesta = await patientService.perfil();

        if (respuesta.error) {
            setError(respuesta.error);
            setPaciente(null);
        } else {
            setPaciente(respuesta.data || null);
        }
    }

    setLoading(false);
};

useEffect(() => {
    cargar();
}, []);

const confirmar = async (citaId) => {
    try {
        if (!citaId) {
            toast.error("No hay cita disponible");
            return;
        }

        await appointmentService.confirmarLlegada(citaId);

        toast.success("Llegada Confirmada");

        cargar();
    } catch (err) {
        toast.error(err.response?.data?.mensaje || "No fue posible confirmar la llegada");
    }
};

if (loading) {
    return (
        <DashboardLayout>
            <h1>Panel Paciente</h1>
            <p>Cargando información...</p>
        </DashboardLayout>
    );
}

if (error) {
    return (
        <DashboardLayout>
            <h1>Panel Paciente</h1>
            <p style={{ color: 'red' }}>{error}</p>
        </DashboardLayout>
    );
}

// Vista para ADMIN: lista de pacientes
if (esAdmin) {
    const citasFiltradas = citas.filter(c => 
        !filtro || 
        (c.paciente?.usuario?.nombre || "").toLowerCase().includes(filtro.toLowerCase()) ||
        (c.medico?.usuario?.nombre || "").toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <DashboardLayout>
            <h1>Panel Paciente - Confirmación de Llegada</h1>
            
            <div style={{marginBottom: '20px'}}>
                <input 
                    type="text"
                    placeholder="Buscar paciente o médico..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        width: '300px'
                    }}
                />
            </div>

            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                    <tr style={{backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd'}}>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Hora</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>RUT Paciente</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Paciente</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Médico</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Estado</th>
                        <th style={{padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd'}}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {citasFiltradas.map(cita => (
                        <tr key={cita.id} style={{borderBottom: '1px solid #ddd', cursor: 'pointer'}} 
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                            <td style={{padding: '12px'}}>{cita.hora}</td>
                            <td style={{padding: '12px'}}>{cita.paciente?.usuario?.rut || '-'}</td>
                            <td style={{padding: '12px'}}>{cita.paciente?.usuario?.nombre}</td>
                            <td style={{padding: '12px'}}>{cita.medico?.usuario?.nombre}</td>
                            <td style={{padding: '12px'}}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: cita.estado === 'AGENDADA' ? '#fff3cd' : '#d4edda',
                                    color: cita.estado === 'AGENDADA' ? '#856404' : '#155724',
                                    fontSize: '0.9em'
                                }}>
                                    {cita.estado}
                                </span>
                            </td>
                            <td style={{padding: '12px', textAlign: 'center'}}>
                                {cita.estado === "AGENDADA" ? (
                                    <>
                                    <button 
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#0066cc',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginRight: '8px'
                                        }}
                                        onClick={() => confirmar(cita.id)}>
                                        Confirmar
                                    </button>
                                    <button
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#f1f5f9',
                                            color: '#0f172a',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            const val = cita.codigo_qr || (cita.id ? `CITA-${cita.id}` : null);
                                            setQrValue(val ? `${window.location.origin}/confirmar-llegada/${val}` : null);
                                            setQrVisible(!!val);
                                        }}
                                    >
                                        QR
                                    </button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{color: '#28a745', fontWeight: 'bold', marginRight: '8px'}}>✓ Registrado</span>
                                        <button
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#f1f5f9',
                                                color: '#0f172a',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                const val = cita.codigo_qr || (cita.id ? `CITA-${cita.id}` : null);
                                                setQrValue(val ? `${window.location.origin}/confirmar-llegada/${val}` : null);
                                                setQrVisible(!!val);
                                            }}
                                        >
                                            QR
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {citasFiltradas.length === 0 && (
                <p style={{marginTop: '20px', textAlign: 'center', color: '#999'}}>No hay citas registradas hoy</p>
            )}

            {qrModal}
        </DashboardLayout>
    );
}

// Vista para PACIENTE: su perfil
if (!paciente) {
    return (
        <DashboardLayout>
            <h1>Panel Paciente</h1>
            <p>No se encontró el perfil del paciente.</p>
        </DashboardLayout>
    );
}

return(

<DashboardLayout>

<h1>Panel Paciente</h1>

<div className="cardPaciente">

<h2>{paciente.usuario?.nombre || 'Paciente'}</h2>

<p>RUT: {paciente.usuario?.rut ? formatRut(paciente.usuario.rut) : '-'}</p>

<p>Médico: {paciente.cita?.medico?.usuario?.nombre || 'Sin médico asignado'}</p>

<p>Especialidad: {paciente.cita?.medico?.especialidad || '-'}</p>

<p>Fecha: {paciente.cita?.fecha || '-'}</p>

<p>Hora: {paciente.cita?.hora || '-'}</p>

<p>Estado: {paciente.cita?.estado || 'Sin cita'}</p>

{(() => {
  const qrValue = paciente.cita?.codigo_qr || (paciente.cita?.id ? `CITA-${paciente.cita.id}` : null);
  return qrValue ? (
    <div style={{ margin: '20px 0', padding: '16px', border: '1px solid #dce7f5', borderRadius: '12px', background: '#f8fbff' }}>
      <p style={{ marginBottom: '12px', fontWeight: 600 }}>Escanea este QR para confirmar tu llegada</p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <QRCodeSVG value={`${window.location.origin}/confirmar-llegada/${qrValue}`} size={220} level="H" />
      </div>
      <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: 0 }}>{qrValue}</p>
    </div>
  ) : null;
})()}

<button onClick={() => confirmar(paciente.cita?.id)} disabled={!paciente.cita?.id}>
Confirmar Llegada
</button>

<button onClick={()=>setMostrar(true)}>
Actualizar Datos
</button>

</div>

{
mostrar &&
<ActualizarDatosModal
cerrar={() => {
setMostrar(false);
cargar();
}}
/>
}

{qrModal}

</DashboardLayout>

);

}

export default Paciente;

