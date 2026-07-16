import DashboardLayout from "../../layouts/DashboardLayout";

import { useState } from "react";

import Agenda from "./Agenda";

import Llegadas from "./Llegadas";

import EstadoMedicos from "./EstadoMedicos";

import "./Administrativo.css";

function Administrativo(){

const[pestaña,setPestaña]=useState("agenda");

return(

<DashboardLayout>

<h1>

Panel Administrativo

</h1>

<div className="menuAdmin">

<button

onClick={()=>setPestaña("agenda")}

>

Agenda Médica

</button>

<button

onClick={()=>setPestaña("llegadas")}

>

Llegadas

</button>

<button

onClick={()=>setPestaña("medicos")}

>

Estado Médicos

</button>

</div>

{

pestaña==="agenda"&&<Agenda/>

}

{

pestaña==="llegadas"&&<Llegadas/>

}

{

pestaña==="medicos"&&<EstadoMedicos/>

}

</DashboardLayout>

);

}

export default Administrativo;