# Sistema de Atención QR

Este repositorio contiene varios microservicios y un frontend para el sistema de atención médica.

## Estructura

- `backend/admin-service` - Microservicio administrativo
- `backend/appointment-service` - Microservicio de citas
- `backend/auth-service` - Microservicio de autenticación
- `backend/medical-service` - Microservicio médico
- `backend/patient-service` - Microservicio de pacientes
- `frontend` - Aplicación React/Vite

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
- `frontend` en el puerto `5173`

## Notas

- Se usa PostgreSQL para la base de datos.
- Las variables de entorno se proporcionan desde el `docker-compose.yml`.
- El frontend está configurado para conectarse a los servicios backend por nombre de servicio Docker.
