import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import toast from '../../utils/toast';

function ConfirmarLlegadaPage() {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const [estado, setEstado] = useState('confirmando');
    const [mensaje, setMensaje] = useState('Confirmando tu llegada...');

    useEffect(() => {
        const confirmar = async () => {
            try {
                const respuesta = await appointmentService.confirmarPorCodigoQR(codigo);
                setMensaje(respuesta?.mensaje || 'Llegada confirmada');
                setEstado('ok');
                toast.success(respuesta?.mensaje || 'Llegada confirmada');
            } catch (error) {
                const detalle = error.response?.data?.mensaje || 'No fue posible confirmar la llegada';
                setMensaje(detalle);
                setEstado('error');
                toast.error(detalle);
            }
        };

        if (codigo) {
            confirmar();
        } else {
            setMensaje('No se recibió un código de confirmación');
            setEstado('error');
        }
    }, [codigo]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f7fb',
            padding: '24px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                padding: '32px',
                maxWidth: '480px',
                width: '100%',
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '12px', color: '#1565c0' }}>Confirmación de llegada</h2>
                <p style={{ marginBottom: '20px', color: '#4b5563' }}>{mensaje}</p>

                <div style={{
                    margin: '20px 0',
                    padding: '16px',
                    borderRadius: '12px',
                    background: estado === 'ok' ? '#e8f5e9' : estado === 'error' ? '#ffebee' : '#f3f7ff'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: estado === 'ok' ? '#2e7d32' : estado === 'error' ? '#c62828' : '#1565c0' }}>
                        {estado === 'ok' ? 'Tu cita quedó confirmada.' : estado === 'error' ? 'No se pudo completar la confirmación.' : 'Procesando confirmación...'}
                    </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#1565c0',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}

export default ConfirmarLlegadaPage;
