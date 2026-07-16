import {useState} from "react";

import patientService from "../../services/patientService";

import toast from "../../utils/toast";

import "./ActualizarDatosModal.css";

function ActualizarDatosModal({cerrar}){

const[datos,setDatos]=useState({

direccion:"",

telefono:"",

fecha_nacimiento:"",

contacto_emergencia:"",

telefono_emergencia:"",

alergias:"",

observaciones:""

});

const cambiar=(e)=>{

setDatos({

...datos,

[e.target.name]:e.target.value

});

}

const guardar=async(e)=>{

    e.preventDefault();

    try{
        await patientService.actualizar(datos);
        toast.success("Datos Actualizados");
        cerrar();
    } catch(err){
        toast.error("No fue posible actualizar los datos");
    }

}

return(

<div className="modal">

<div className="modalContenido">

<h2>

Actualizar Datos

</h2>

<form onSubmit={guardar}>

<input name="direccion" placeholder="Dirección" onChange={cambiar}/>

<input name="telefono" placeholder="Teléfono" onChange={cambiar}/>

<input type="date" name="fecha_nacimiento" onChange={cambiar}/>

<input name="contacto_emergencia" placeholder="Contacto Emergencia" onChange={cambiar}/>

<input name="telefono_emergencia" placeholder="Teléfono Emergencia" onChange={cambiar}/>

<textarea name="alergias" placeholder="Alergias" onChange={cambiar}></textarea>

<textarea name="observaciones" placeholder="Observaciones" onChange={cambiar}></textarea>

<div className="botones">

<button>

Guardar

</button>

<button

type="button"

onClick={cerrar}

>

Cancelar

</button>

</div>

</form>

</div>

</div>

);

}

export default ActualizarDatosModal;