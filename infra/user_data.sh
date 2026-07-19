#!/bin/bash
# =============================================================
# user_data.sh — Inicialización de cada EC2 (se ejecuta una vez al
# lanzar la instancia). Instala Docker, clona el repo, escribe el
# .env de docker-compose.prod.yml y levanta el stack completo.
# =============================================================

set -e
exec > /var/log/user_data.log 2>&1

echo "=== Iniciando user_data.sh ==="

apt-get update -y
apt-get install -y ca-certificates curl gnupg git

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

echo "=== Docker instalado ==="

usermod -aG docker ubuntu
chmod 666 /var/run/docker.sock

# -------------------------------------------------------------
# Clonar el repo (con PAT si es privado; el token no queda en ningún
# archivo committeado, solo en el user_data resuelto por Terraform
# en tiempo de apply, a partir de una variable sensible)
# -------------------------------------------------------------
APP_DIR=/opt/sistema-atencion-qr

if [ -n "${github_pat}" ]; then
  CLONE_URL=$(echo "${github_repo_url}" | sed "s#https://#https://${github_pat}@#")
else
  CLONE_URL="${github_repo_url}"
fi

git clone --branch "${github_branch}" --depth 1 "$CLONE_URL" "$APP_DIR"
cd "$APP_DIR"

echo "=== Repo clonado ==="

# -------------------------------------------------------------
# .env para docker-compose.prod.yml
# Mismo mecanismo ya usado en local (env_file), nunca hardcodeado
# en docker-compose.prod.yml ni en este script fuera de esta sección
# generada en tiempo de apply.
# -------------------------------------------------------------
ALB_ORIGIN="http://${alb_dns_name}"

cat > .env <<EOF
DB_PASSWORD=${db_password_app}
JWT_SECRET=${jwt_secret}
INTERNAL_API_KEY=${internal_api_key}
ALLOWED_ORIGINS=$ALB_ORIGIN
ADMIN_SERVICE_URL=http://admin-service:3001
APPOINTMENT_SERVICE_URL=http://appointment-service:3002
AZURE_STORAGE_CONNECTION_STRING=${azure_storage_connection_string}
AZURE_STORAGE_CONTAINER_NAME=${azure_storage_container_name}
VITE_AUTH_URL=$ALB_ORIGIN
VITE_ADMIN_URL=$ALB_ORIGIN
VITE_PATIENT_URL=$ALB_ORIGIN
VITE_APPOINTMENT_URL=$ALB_ORIGIN
VITE_MEDICAL_URL=$ALB_ORIGIN
EOF

echo "=== .env escrito ==="

# -------------------------------------------------------------
# Levantar el stack completo (sin Azurite: ya se usa la cuenta real
# de Azure Blob Storage). El build de las 6 imágenes es lo que más
# tarda de todo user_data.
# -------------------------------------------------------------
docker compose -f docker-compose.prod.yml up -d --build

echo "=== Stack levantado ==="
echo "=== user_data.sh completado ==="
