import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import adminService from "../../services/adminService";

import { formatRut } from "../../utils/rut";

import "./Dashboard.css";

function Dashboard() {

const[usuarios,setUsuarios]=useState([]);

const[cargando,setCargando]=useState(true);

const cargarUsuarios=async()=>{

try{

const respuesta=await adminService.listarUsuarios();

setUsuarios(respuesta.data);

}
catch(error){

console.log(error);

}
finally{

setCargando(false);

}

}

useEffect(()=>{

cargarUsuarios();

},[]);

const totalUsuarios = usuarios.length;
const totalAdministrativos = usuarios.filter(u => u.rol_id === 3).length;
const totalMedicos = usuarios.filter(u => u.rol_id === 2).length;
const totalPacientes = usuarios.filter(u => u.rol_id === 4).length;
const totalActivos = usuarios.filter(u => u.activo).length;
const totalInactivos = usuarios.filter(u => !u.activo).length;
const ultimosUsuarios = usuarios.slice(-5).reverse();

return (

<DashboardLayout hideSidebar={true}>

<h1>QR Hospitalario</h1>

<div className="cards">

<div className="card">

<h3>Usuarios</h3>

<span>{totalUsuarios}</span>

</div>

<div className="card">

<h3>Médicos</h3>

<span>{totalMedicos}</span>

</div>

<div className="card">

<h3>Administrativos</h3>

<span>{totalAdministrativos}</span>

</div>

<div className="card">

<h3>Pacientes</h3>

<span>{totalPacientes}</span>

</div>

</div>

<div className="dashboard-actions">

<Link className="action-card" to="/admin/usuarios">Gestionar Usuarios</Link>

<Link className="action-card" to="/administrativo">Panel Administrativo</Link>

<Link className="action-card" to="/medico">Panel Médico</Link>

<Link className="action-card" to="/paciente">Panel Paciente</Link>

<Link className="action-card" to="/trazabilidad">Trazabilidad</Link>

</div>

<div className="contenido dashboard-grid">

<div className="dashboard-summary">

<h2>Estado del Sistema</h2>

<p>Sistema Hospital QR funcionando correctamente.</p>

{cargando ? (

<p>Cargando información...</p>

) : (

<>

<div className="status-cards">

<div className="status-card">

<h4>Activos</h4>

<strong>{totalActivos}</strong>

</div>

<div className="status-card">

<h4>Inactivos</h4>

<strong>{totalInactivos}</strong>

</div>

</div>

<p className="small-text">Usuarios registrados: {totalUsuarios}</p>

</>

)}

</div>

<div className="dashboard-recent">

<h2>Últimos usuarios registrados</h2>

<table className="recent-table">
<thead>
<tr>
<th>Rut</th>
<th>Nombre</th>
<th>Rol</th>
<th>Estado</th>
</tr>
</thead>
<tbody>
{ultimosUsuarios.map((usuario) => (
<tr key={usuario.id}>
<td>{formatRut(usuario.rut)}</td>
<td>{usuario.nombre}</td>
<td>{usuario.rol?.nombre || usuario.Rol?.nombre || usuario.rol_id}</td>
<td>{usuario.activo ? "Activo" : "Inactivo"}</td>
</tr>
))}
</tbody>
</table>

</div>

</div>

</DashboardLayout>

);

}

export default Dashboard;