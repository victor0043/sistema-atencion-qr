# =============================================================
# Variables — sistema-atencion-qr Infraestructura AWS
# Mismo patrón que sca-it/infra (AWS Academy Learner Lab):
# LabInstanceProfile en vez de IAM propio, sin NAT Gateway,
# credenciales de AWS solo por variables de entorno estándar.
# =============================================================

variable "project_name" {
  description = "Nombre del proyecto (prefijo para todos los recursos)"
  type        = string
  default     = "hospitalqr"
}

variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

# AMI de Ubuntu 22.04 LTS en us-east-1 (mismo valor usado en sca-it/infra;
# verificar vigencia en AWS Console > EC2 > AMI Catalog antes de aplicar)
variable "ec2_ami" {
  description = "AMI de Ubuntu 22.04 LTS para us-east-1"
  type        = string
  default     = "ami-0c7217cdde317cfec"
}

# t3.small (2 GiB RAM) y no t3.micro (1 GiB): cada EC2 corre 7 contenedores
# simultáneos (postgres local + 5 microservicios Node + frontend), más de lo
# que necesitaba sca-it (un solo contenedor Laravel). Verificar que el Lab
# no lo restrinja (Academy Labs normalmente permiten toda la familia t3
# "small"/"medium", solo bloquean instancias grandes/especializadas).
variable "ec2_instance_type" {
  description = "Tipo de instancia EC2 para correr el stack completo"
  type        = string
  default     = "t3.small"
}

variable "key_pair_name" {
  description = "Nombre del Key Pair de AWS para acceso SSH a las EC2"
  type        = string
  # Crear en AWS Console > EC2 > Key Pairs antes de aplicar Terraform
}

variable "ssh_allowed_cidr" {
  description = "IP desde la que se permite SSH (tu IP pública + /32)"
  type        = string
  default     = "0.0.0.0/0" # Cambiar a tu IP real: ej. '200.10.20.30/32'
}

# Rol de instancia del AWS Academy Lab (no se pueden crear roles IAM nuevos
# en un Learner Lab; solo se puede referenciar el que el Lab ya provisionó)
variable "lab_instance_profile" {
  description = "Nombre del Instance Profile del LabRole (AWS Academy)"
  type        = string
  default     = "LabInstanceProfile"
}

# -------------------------------------------------------------
# RDS PostgreSQL (provisionado esta iteración, NO conectado a la
# app todavía — eso es la siguiente iteración)
# -------------------------------------------------------------

variable "db_name" {
  description = "Nombre de la base de datos PostgreSQL en RDS"
  type        = string
  default     = "hospital_qr"
}

variable "db_username" {
  description = "Usuario administrador de RDS"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Contraseña de RDS (sensible; nunca hardcodear ni versionar)"
  type        = string
  sensitive   = true
}

# Learner Lab: Multi-AZ duplica el costo del RDS (levanta un standby) y en la
# práctica no alcanza a justificarse contra el presupuesto fijo del Lab
# (~USD 50 totales) ni contra la duración de sesión (se cae cada pocas horas).
# El proyecto de referencia (sca-it) también lo dejó en false. Se deja como
# variable (no hardcodeado) para poder probarlo en una sesión real si se
# quiere verificar si el Lab lo permite, sin tener que tocar el .tf.
variable "rds_multi_az" {
  description = "Si RDS corre en Multi-AZ (probablemente no soportado/no conviene en un Learner Lab; ver README de infra)"
  type        = bool
  default     = false
}

variable "rds_instance_class" {
  description = "Clase de instancia RDS (db.t3.micro es la elegible para free tier / la más probada en Academy Labs)"
  type        = string
  default     = "db.t3.micro"
}

# -------------------------------------------------------------
# Despliegue de la app (clonada por git en cada EC2 vía user_data;
# no hay todavía imágenes publicadas en un registry / pipeline CI-CD)
# -------------------------------------------------------------

variable "github_repo_url" {
  description = "URL HTTPS del repo (sin token) para clonar en cada EC2"
  type        = string
  default     = "https://github.com/victor0043/sistema-atencion-qr.git"
}

variable "github_pat" {
  description = "Personal Access Token para clonar el repo si es privado (sensible; vacío si el repo es público)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "github_branch" {
  description = "Branch a clonar en cada EC2"
  type        = string
  default     = "main"
}

# -------------------------------------------------------------
# Secretos de la app (mismo mecanismo .env ya usado en docker-compose.yml
# local; aquí se inyectan a la EC2 vía user_data, nunca hardcodeados en .tf)
# -------------------------------------------------------------

variable "db_password_app" {
  description = "DB_PASSWORD para el Postgres local de cada EC2 (docker-compose.prod.yml), independiente del password de RDS"
  type        = string
  sensitive   = true
  default     = "admin123"
}

variable "jwt_secret" {
  description = "JWT_SECRET compartido entre los 5 microservicios"
  type        = string
  sensitive   = true
  default     = "HospitalQR2026"
}

variable "internal_api_key" {
  description = "INTERNAL_API_KEY para las llamadas service-to-service"
  type        = string
  sensitive   = true
  default     = "secret-internal-key"
}

variable "azure_storage_connection_string" {
  description = "Connection string real de la cuenta de Azure Storage (qrmulticloud) — sensible"
  type        = string
  sensitive   = true
}

variable "azure_storage_container_name" {
  description = "Nombre del container de Azure Blob Storage"
  type        = string
  default     = "contenedorqr"
}
