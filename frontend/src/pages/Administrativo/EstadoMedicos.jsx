import { useEffect, useState, useRef } from "react";
import medicalService from "../../services/medicalService";
import "./EstadoMedicos.css";

function EstadoMedicos() {

	const [medicos, setMedicos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const intervalRef = useRef(null);

	const cargar = async () => {
		setLoading(true);
		setError(null);
		try {
			const respuesta = await medicalService.listar();
			setMedicos(respuesta.data || []);
		} catch (err) {
			console.error(err);
			setError("No fue posible cargar el estado de médicos");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// carga inicial
		cargar();
		// intervalo configurable via env VITE_ESTADO_MEDICOS_POLL_INTERVAL (segundos)
		const envInterval = parseInt(import.meta.env.VITE_ESTADO_MEDICOS_POLL_INTERVAL || "", 10);
		const intervaloMs = Number.isFinite(envInterval) && envInterval > 0 ? envInterval * 1000 : 5000;
		intervalRef.current = setInterval(cargar, intervaloMs);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	return (
		<div className="estado-medicos-container">
			<div className="estado-medicos-header">
				<h2>Estado de Médicos</h2>
				<div className="acciones">
					<button onClick={cargar} className="btn-actualizar">Actualizar</button>
				</div>
			</div>

			{loading && <p className="info">Cargando...</p>}
			{error && <p className="error">{error}</p>}

			<div className="tabla-wrap">
				<table className="tabla-medicos">
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Especialidad</th>
							<th>Box</th>
							<th>Estado</th>
						</tr>
					</thead>
					<tbody>
						{medicos.length === 0 && !loading ? (
							<tr>
								<td colSpan={4} className="sin-datos">No hay médicos</td>
							</tr>
						) : (
							medicos.map((m) => (
								<tr key={m.id}>
									<td>{m.usuario?.nombre || "-"}</td>
									<td>{m.especialidad || "-"}</td>
									<td>{m.box || "-"}</td>
									<td>{m.estado || "-"}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);

}

export default EstadoMedicos;