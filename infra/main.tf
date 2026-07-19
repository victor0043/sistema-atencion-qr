# =============================================================
# sistema-atencion-qr — Infraestructura AWS (Ev.3)
# AWS: VPC + EC2 x2 (2 AZ) + ALB (1, con 6 target groups) + RDS PostgreSQL
# Azure: Storage Account "qrmulticloud"/"contenedorqr" — ya existe, se
#        intenta traer bajo IaC en azure.tf (import), no se recrea.
# Región: us-east-1 | AZ: us-east-1a y us-east-1b
#
# AWS Academy Learner Lab:
# - Credenciales SOLO desde variables de entorno estándar
#   (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN).
#   No hay bloque de credenciales en el provider "aws" a propósito.
# - No se crean roles/policies IAM: se referencia LabInstanceProfile,
#   ya provisionado por el Lab (ver variable lab_instance_profile).
# - Sin NAT Gateway: las EC2 van en subredes públicas (necesitan salida a
#   internet en el user_data para apt-get/git/docker), el SG restringe
#   qué puede llegar a los puertos de la app.
# =============================================================

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# -------------------------------------------------------------
# VPC
# -------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name     = "${var.project_name}-vpc"
    Proyecto = var.project_name
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# -------------------------------------------------------------
# Subredes públicas (EC2 + ALB) — una por AZ
# -------------------------------------------------------------
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-subnet-publica-a"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-subnet-publica-b"
  }
}

# Subredes privadas (RDS) — sin IP pública
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "${var.project_name}-subnet-privada-a"
  }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "${var.project_name}-subnet-privada-b"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-rt-publica"
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# -------------------------------------------------------------
# Security Groups
# -------------------------------------------------------------

# ALB: acepta HTTP (80) desde internet (443 dejado abierto para cuando
# haya certificado, sin listener todavía)
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-sg-alb"
  description = "Trafico entrante al balanceador de carga"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP publico"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS publico (reservado, sin listener aun)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-alb"
  }
}

# EC2: acepta trafico en los puertos de los 6 servicios SOLO desde el ALB,
# y SSH solo desde la IP indicada
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-sg-ec2"
  description = "Trafico a las instancias que corren el stack completo"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "frontend desde ALB"
    from_port       = 5173
    to_port         = 5173
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "auth-service desde ALB"
    from_port       = 3003
    to_port         = 3003
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "admin-service desde ALB"
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "appointment-service desde ALB"
    from_port       = 3002
    to_port         = 3002
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "patient-service desde ALB"
    from_port       = 3005
    to_port         = 3005
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "medical-service desde ALB"
    from_port       = 3004
    to_port         = 3004
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description = "SSH desde tu IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-ec2"
  }
}

# RDS: acepta PostgreSQL (5432) SOLO desde las EC2. No se conecta la app
# todavia (siguiente iteracion) pero el SG ya queda listo para eso.
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-sg-rds"
  description = "Trafico a la base de datos PostgreSQL gestionada"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL desde EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-rds"
  }
}

# -------------------------------------------------------------
# RDS PostgreSQL (gestionado, provisionado pero NO conectado a la app
# todavia — ver nota en variables.tf sobre rds_multi_az)
# -------------------------------------------------------------
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-db"
  engine            = "postgres"
  engine_version    = "15"
  instance_class    = var.rds_instance_class
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  publicly_accessible = false
  multi_az            = var.rds_multi_az
  skip_final_snapshot = true

  tags = {
    Name = "${var.project_name}-postgres"
  }
}

# -------------------------------------------------------------
# EC2 — Instancia A (AZ us-east-1a) y B (us-east-1b)
# Cada una corre el stack COMPLETO (5 microservicios + frontend +
# su propio Postgres local) via docker-compose.prod.yml. Como RDS
# todavia no esta conectado, las dos instancias NO comparten base de
# datos entre si — ver limitacion documentada en el informe.
# -------------------------------------------------------------

locals {
  user_data_common = {
    github_repo_url                 = var.github_repo_url
    github_pat                      = var.github_pat
    github_branch                   = var.github_branch
    db_password_app                 = var.db_password_app
    jwt_secret                      = var.jwt_secret
    internal_api_key                = var.internal_api_key
    azure_storage_connection_string = var.azure_storage_connection_string
    azure_storage_container_name    = var.azure_storage_container_name
    # Las 5 VITE_*_URL y ALLOWED_ORIGINS apuntan al mismo DNS del ALB: el
    # listener del ALB enruta por path (/api/auth, /api/admin, etc.) al
    # target group correcto, así que todas comparten el mismo origen.
    alb_dns_name = aws_lb.main.dns_name
  }
}

resource "aws_instance" "app_a" {
  ami                    = var.ec2_ami
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = var.lab_instance_profile
  key_name               = var.key_pair_name

  user_data = templatefile("${path.module}/user_data.sh", local.user_data_common)

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "${var.project_name}-app-a"
  }
}

resource "aws_instance" "app_b" {
  ami                    = var.ec2_ami
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.public_b.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = var.lab_instance_profile
  key_name               = var.key_pair_name

  user_data = templatefile("${path.module}/user_data.sh", local.user_data_common)

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "${var.project_name}-app-b"
  }
}

# -------------------------------------------------------------
# Application Load Balancer — UNO solo, con un target group por
# servicio (frontend + 5 microservicios), enrutando por path.
# -------------------------------------------------------------
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# --- Target groups: cada uno con las MISMAS dos instancias, distinto puerto ---

resource "aws_lb_target_group" "frontend" {
  name     = "${var.project_name}-tg-frontend"
  port     = 5173
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 10
    matcher             = "200"
  }

  tags = { Name = "${var.project_name}-tg-frontend" }
}

resource "aws_lb_target_group" "auth" {
  name     = "${var.project_name}-tg-auth"
  port     = 3003
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 10
    matcher             = "200"
  }

  tags = { Name = "${var.project_name}-tg-auth" }
}

resource "aws_lb_target_group" "admin" {
  name     = "${var.project_name}-tg-admin"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 10
    matcher             = "200"
  }

  tags = { Name = "${var.project_name}-tg-admin" }
}

resource "aws_lb_target_group" "appointment" {
  name     = "${var.project_name}-tg-appt"
  port     = 3002
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 10
    matcher             = "200"
  }

  tags = { Name = "${var.project_name}-tg-appt" }
}

resource "aws_lb_target_group" "patient" {
  name     = "${var.project_name}-tg-patient"
  port     = 3005
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 10
    matcher             = "200"
  }

  tags = { Name = "${var.project_name}-tg-patient" }
}

resource "aws_lb_target_group" "medical" {
  name     = "${var.project_name}-tg-medical"
  port     = 3004
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 10
    matcher             = "200"
  }

  tags = { Name = "${var.project_name}-tg-medical" }
}

# --- Registrar las dos instancias en cada uno de los 6 target groups ---

locals {
  target_groups = {
    frontend    = aws_lb_target_group.frontend
    auth        = aws_lb_target_group.auth
    admin       = aws_lb_target_group.admin
    appointment = aws_lb_target_group.appointment
    patient     = aws_lb_target_group.patient
    medical     = aws_lb_target_group.medical
  }
}

resource "aws_lb_target_group_attachment" "a" {
  for_each         = local.target_groups
  target_group_arn = each.value.arn
  target_id        = aws_instance.app_a.id
  port             = each.value.port
}

resource "aws_lb_target_group_attachment" "b" {
  for_each         = local.target_groups
  target_group_arn = each.value.arn
  target_id        = aws_instance.app_b.id
  port             = each.value.port
}

# --- Listener HTTP :80 — default al frontend, reglas por path al resto ---

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "auth" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.auth.arn
  }

  condition {
    path_pattern {
      values = ["/api/auth/*"]
    }
  }
}

resource "aws_lb_listener_rule" "admin" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin.arn
  }

  condition {
    path_pattern {
      values = ["/api/admin/*"]
    }
  }
}

resource "aws_lb_listener_rule" "appointment" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 30

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.appointment.arn
  }

  condition {
    path_pattern {
      values = ["/api/appointments/*"]
    }
  }
}

resource "aws_lb_listener_rule" "patient" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 40

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.patient.arn
  }

  condition {
    path_pattern {
      values = ["/api/patients/*"]
    }
  }
}

resource "aws_lb_listener_rule" "medical" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 50

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.medical.arn
  }

  condition {
    path_pattern {
      values = ["/api/medical/*"]
    }
  }
}
