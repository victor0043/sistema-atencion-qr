const bcrypt = require('bcrypt');
const { fn, col, where } = require('sequelize');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

const { generarToken } = require('../utils/jwt');

class AuthService {

    async login(rut, password){

        try{

            const cleanRut = String(rut || '').toUpperCase().replace(/[\.\-\s]/g, '');

            // Buscar usuario con RUT normalizado
            // El modelo tiene hook que normaliza RUT al guardar,
            // así que buscamos con igualdad simple (sin regex_replace)
            const usuario = await Usuario.findOne({
                where: { rut: cleanRut },
                include:[
                    {
                        model: Rol,
                        attributes:['id','nombre']
                    }
                ]
            });

            if(!usuario){

                return{

                    ok:false,
                    mensaje:'Usuario no encontrado'

                };

            }

            // Verificar usuario activo

            if(!usuario.activo){

                return{

                    ok:false,
                    mensaje:'Usuario deshabilitado'

                };

            }

            // Comparar contraseña

            const passwordCorrecta = await bcrypt.compare(
                password,
                usuario.password
            );

            if(!passwordCorrecta){

                return{

                    ok:false,
                    mensaje:'Contraseña incorrecta'

                };

            }

            // Generar Token

            const token = generarToken(usuario);

            let rolNombre = null;
            if (usuario.Rol && usuario.Rol.nombre) {
                rolNombre = usuario.Rol.nombre;
            } else if (usuario.role && usuario.role.nombre) {
                rolNombre = usuario.role.nombre;
            } else if (usuario.rol && usuario.rol.nombre) {
                rolNombre = usuario.rol.nombre;
            } else {
                const rol = await Rol.findByPk(usuario.rol_id);
                rolNombre = rol ? rol.nombre : null;
            }

            return{

                ok:true,

                token,

                usuario:{
                    id:usuario.id,
                    rut:usuario.rut,
                    nombre:usuario.nombre,
                    correo:usuario.correo,
                    rol: rolNombre ? String(rolNombre).toUpperCase() : null
                }

            };

        }

        catch(error){

            console.log(error);

            return{

                ok:false,
                mensaje:'Error interno del servidor'

            };

        }

    }

}

module.exports = new AuthService();