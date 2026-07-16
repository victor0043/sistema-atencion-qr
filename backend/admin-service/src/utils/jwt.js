//=========================================
// RESPUESTAS GENERALES DEL SISTEMA
//=========================================


const respuestaOk = (mensaje, datos = null) => {

    return {

        ok: true,

        mensaje,

        datos

    };

};



const respuestaError = (mensaje, error = null) => {

    return {

        ok: false,

        mensaje,

        error

    };

};



//=========================================
// PAGINACION
//=========================================


const paginar = (pagina = 1, limite = 10) => {


    const offset = (pagina - 1) * limite;


    return {

        limit: limite,

        offset

    };


};



//=========================================
// LIMPIAR DATOS
//=========================================


const limpiarTexto = (texto)=>{


    if(!texto){

        return "";

    }


    return texto
        .trim()
        .replace(/\s+/g,' ');


};



//=========================================
// EXPORTAR
//=========================================


module.exports = {

    respuestaOk,

    respuestaError,

    paginar,

    limpiarTexto

};