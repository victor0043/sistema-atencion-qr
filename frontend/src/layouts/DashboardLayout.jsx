import Navbar from "../components/Navbar";

import Sidebar from "../components/Sidebar";

import "./DashboardLayout.css";

function DashboardLayout({ children, hideSidebar = false }) {

    return (

        <>

            <Navbar />

            <div className={`contenedor${hideSidebar ? " sin-sidebar" : ""}`}>

                {!hideSidebar && <Sidebar />}

                <main>

                    {children}

                </main>

            </div>

        </>

    );

}

export default DashboardLayout;