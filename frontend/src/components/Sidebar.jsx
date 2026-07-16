import "./Sidebar.css";

import { Link } from "react-router-dom";

function Sidebar() {

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const rol = usuario?.rol || localStorage.getItem("rol");

    return (

        <aside className="sidebar">

            <Link to="/dashboard">Inicio</Link>

            {

                rol === "ADMIN" &&

                <>

                    <Link to="/admin">

                        QR Hospitalario

                    </Link>

                    <Link to="/admin/usuarios">

                        Usuarios

                    </Link>

                    <Link to="/administrativo">

                        Administrativo

                    </Link>

                    <Link to="/medico">

                        Médico

                    </Link>

                    <Link to="/paciente">

                        Paciente

                    </Link>

                    <Link to="/trazabilidad">

                        Trazabilidad

                    </Link>

                </>

            }
            {

                rol === "ADMINISTRATIVO" &&

                <>

                    <Link to="/administrativo">

                        Administrativo

                    </Link>

                    <Link to="/paciente">

                        Paciente

                    </Link>

                    <Link to="/trazabilidad">

                        Trazabilidad

                    </Link>

                </>

            }
            {

                rol === "MEDICO" &&

                <>

                    <Link to="/medico">

                        Médico

                    </Link>

                </>

            }
            {

                rol === "PACIENTE" &&

                <>

                    <Link to="/paciente">

                        Paciente

                    </Link>

                    <Link to="/trazabilidad">

                        Trazabilidad

                    </Link>

                </>

            }

            <button

            onClick={()=>{

                localStorage.clear();

                window.location="/";

            }}

            >

            Cerrar sesión

            </button>

        </aside>

    );

}

export default Sidebar;