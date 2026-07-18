# Sistema de Atención QR

Este repositorio contiene varios microservicios y un frontend para el sistema de atención médica.

## Estructura

- `backend/admin-service` - Microservicio administrativo
- `backend/appointment-service` - Microservicio de citas
- `backend/auth-service` - Microservicio de autenticación
- `backend/medical-service` - Microservicio médico
- `backend/patient-service` - Microservicio de pacientes
- `frontend` - Aplicación React/Vite

## Variables de entorno

Los secretos compartidos (`DB_PASSWORD`, `JWT_SECRET`, `INTERNAL_API_KEY`) se leen desde
un archivo `.env` en la raíz del proyecto (ver `env_file:` en `docker-compose.yml`). Ya existe
un `.env` con valores de desarrollo listos para usar; `.env.example` documenta el formato.

## Ejecutar con Docker Compose

Desde la raíz del proyecto:

```bash
docker-compose up --build
```

Esto levantará:

- `db` en el puerto `5432`
- `admin-service` en el puerto `3001`
- `appointment-service` en el puerto `3002`
- `auth-service` en el puerto `3003`
- `medical-service` en el puerto `3004`
- `patient-service` en el puerto `3005`
- `frontend` en el puerto `5173` (servido internamente por `vite preview` en el `4173` del contenedor)

## Usuario semilla

Al levantar `auth-service` por primera vez, se crea automáticamente (script
`backend/auth-service/src/utils/seed.js`, idempotente) un usuario administrador
con la contraseña ya hasheada con bcrypt:

- **RUT:** `11111111-1` (se ingresa con o sin puntos/guion, el sistema lo normaliza)
- **Password:** `Admin123!`
- **Rol:** ADMIN

También se siembran los 4 roles base (`ADMIN`, `MEDICO`, `ADMINISTRATIVO`, `PACIENTE`)
con ids fijos 1-4, usados por el middleware `verificarRol(...)` en todos los servicios.

## Notas

- Se usa PostgreSQL para la base de datos.
- El frontend está configurado para conectarse a los servicios backend por nombre de servicio Docker.
