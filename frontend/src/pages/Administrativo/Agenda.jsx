import { useEffect, useState, useMemo } from "react";

import appointmentService from "../../services/appointmentService";
import Swal from "sweetalert2";
import toast from "../../utils/toast";
import "./Agenda.css";

import NuevaCitaModal from "./NuevaCitaModal";

function Agenda() {

	const [citas, setCitas] = useState([]);
	const [mostrarModal, setMostrarModal] = useState(false);
	const [citaEnEdicion, setCitaEnEdicion] = useState(null);

	// filtros
	const [filtroMedico, setFiltroMedico] = useState("");
	const [filtroPaciente, setFiltroPaciente] = useState("");
	const [filtroFecha, setFiltroFecha] = useState("");

	// paginación simple
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const cargar = async () => {
		try {
			const respuesta = await appointmentService.listar();
			setCitas(respuesta.data || []);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		cargar();
	}, []);

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
			if (filtroFecha) {
				// comparar fecha (iso date) con fecha del registro si existe
				const fechaCita = c.fecha?.split("T")[0] || c.fecha || "";
				if (!fechaCita.includes(filtroFecha)) return false;
			}
			return true;
		});
	}, [citas, filtroMedico, filtroPaciente, filtroFecha]);

	const totalPages = Math.max(1, Math.ceil(citasFiltradas.length / pageSize));
	const pagedCitas = useMemo(() => {
		const start = (page - 1) * pageSize;
		return citasFiltradas.slice(start, start + pageSize);
	}, [citasFiltradas, page]);

	const exportCSV = () => {
		const rows = [ ["Hora", "Paciente", "Médico", "Estado", "Box", "Fecha"] ];
		citasFiltradas.forEach(c => {
			rows.push([
				c.hora || "",
				c.paciente?.usuario?.nombre || "",
				c.medico?.usuario?.nombre || "",
				c.estado || "",
				c.medico?.box || "",
				c.fecha || ""
			]);
		});
		const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `agenda_export.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const editarCita = (cita) => {
		setCitaEnEdicion(cita);
		setMostrarModal(true);
	};

	const cancelarCita = async (id) => {
		const result = await Swal.fire({
			title: '¿Eliminar cita?',
			text: 'Esta acción no se puede deshacer',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
		});
		if (result.isConfirmed) {
			try {
				await appointmentService.eliminar(id);
				toast.success('Cita eliminada');
				cargar();
			} catch (err) {
				toast.error('No fue posible eliminar la cita');
			}
		}
	};

	return (
		<>

			<div className="barraAgenda">

				<h2>Agenda Médica</h2>

				<div className="acciones-right">
					<button onClick={() => setMostrarModal(true)}>Nueva Hora Médica</button>
					<button className="btn-export" onClick={exportCSV}>Exportar CSV</button>
				</div>

			</div>

			<div className="filtros">
				<select value={filtroMedico} onChange={e => { setFiltroMedico(e.target.value); setPage(1); }}>
					<option value="">Filtrar por médico</option>
					{medicosDisponibles.map(m => (
						<option key={m.id} value={m.id}>{m.nombre}</option>
					))}
				</select>
				<input placeholder="Buscar paciente" value={filtroPaciente} onChange={e => { setFiltroPaciente(e.target.value); setPage(1); }} />
				<input type="date" value={filtroFecha} onChange={e => { setFiltroFecha(e.target.value); setPage(1); }} />
			</div>

			<div className="agenda-card">
			  <table>
				<thead>
					<tr>
						<th>Hora</th>
						<th>Paciente</th>
						<th>Médico</th>
						<th>Estado</th>
						<th>Box</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{pagedCitas.map(cita => (
						<tr key={cita.id}>
							<td>{cita.hora}</td>
							<td>{cita.paciente?.usuario?.nombre}</td>
							<td>{cita.medico?.usuario?.nombre}</td>
							<td>{cita.estado}</td>
							<td>{cita.medico?.box}</td>
							<td>
								<div style={{display:'flex',gap:'8px'}}>
									<button onClick={() => editarCita(cita)}>Editar</button>
									<button onClick={() => cancelarCita(cita.id)} style={{background:'#ef4444'}}>Eliminar</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className="paginacion">
				<button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
				<span> Página {page} de {totalPages} </span>
				<button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</button>
			</div>
			</div>

			{mostrarModal && <NuevaCitaModal cerrar={() => { setMostrarModal(false); setCitaEnEdicion(null); cargar(); }} cita={citaEnEdicion} />}

		</>
	);

}

export default Agenda;