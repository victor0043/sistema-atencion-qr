import { Link, useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar() {

    const navigate = useNavigate();

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const salir = () => {

        localStorage.clear();

        navigate("/");

    };

    return (

        <nav className="navbar">

            <h2>Hospital QR</h2>

            <div>

                <span>

                    {usuario?.nombre}

                </span>

                <button onClick={salir}>

                    Salir

                </button>

            </div>

        </nav>

    );

}

export default Navbar;