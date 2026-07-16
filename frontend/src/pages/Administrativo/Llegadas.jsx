import { useEffect, useState, useMemo } from "react";

import appointmentService from "../../services/appointmentService";
import toast from "../../utils/toast";

import "./Llegadas.css";


function Llegadas(){

	const [citas, setCitas] = useState([]);
	const [filtroMedico, setFiltroMedico] = useState("");
	const [filtroPaciente, setFiltroPaciente] = useState("");

	const cargar = async () => {
		try {
			const respuesta = await appointmentService.obtenerAgendaHoy();
			setCitas(respuesta.data || []);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		cargar();
	}, []);

	const confirmarLlegada=async(id)=>{

try{

	await appointmentService.confirmarLlegada(id);

	toast.success("Paciente registrado");

	cargar();

}

catch(error){

	toast.error("No fue posible registrar la llegada");

}

}


	const medicosDisponibles = useMemo(() => {
		const map = {};
		citas.forEach(c => {
			const m = c.medico?.usuario?.nombre;
			const id = c.medico?.id;
			if (m && id) map[id] = m;
		});
		return Object.entries(map).map(([id, nombre]) => ({ id, nombre }));
	}, [citas]);

	const citasFiltradas = useMemo(() => {
		return citas.filter(c => {
			if (filtroMedico && String(c.medico?.id) !== String(filtroMedico)) return false;
			if (filtroPaciente && !(c.paciente?.usuario?.nombre || "").toLowerCase().includes(filtroPaciente.toLowerCase())) return false;
			return true;
		});
	}, [citas, filtroMedico, filtroPaciente]);

	return (

		<div className="llegadas-container">

			<h2>Llegadas de Pacientes</h2>

			<div className="filtros-llegadas">
				<select value={filtroMedico} onChange={e => setFiltroMedico(e.target.value)}>
					<option value="">Filtrar por médico</option>
					{medicosDisponibles.map(m => (
						<option key={m.id} value={m.id}>{m.nombre}</option>
					))}
				</select>
				<input placeholder="Buscar paciente" value={filtroPaciente} onChange={e => setFiltroPaciente(e.target.value)} />
				<button onClick={cargar} className="btn-actualizar">Actualizar</button>
			</div>

			<table className="llegadas-table">

				<thead>

					<tr>

						<th>Hora</th>

						<th>Paciente</th>

						<th>Médico</th>

						<th>Estado</th>

						<th>Acción</th>

					</tr>

				</thead>

				<tbody>

					{citasFiltradas.map(cita => (

						<tr key={cita.id}>

							<td>{cita.hora}</td>

							<td>{cita.paciente?.usuario?.nombre}</td>

							<td>{cita.medico?.usuario?.nombre}</td>

							<td>{cita.estado}</td>

							<td>

								{cita.estado === "AGENDADA" ? (

									<button className="btn-confirmar" onClick={() => confirmarLlegada(cita.id)}>Confirmar Llegada</button>

								) : (

									<span>Paciente Registrado</span>

								)}

							</td>

						</tr>

					))}

				</tbody>

			</table>

		</div>

	);

}

export default Llegadas;