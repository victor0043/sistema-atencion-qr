# =============================================================
# Outputs — sistema-atencion-qr Infraestructura
# =============================================================

output "alb_dns" {
  description = "DNS público del ALB (URL de la app — frontend y todas las APIs)"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "Endpoint del RDS PostgreSQL (para conectar la app en la siguiente iteración)"
  value       = aws_db_instance.postgres.address
}

output "ec2_a_ip" {
  description = "IP pública de la instancia A (us-east-1a)"
  value       = aws_instance.app_a.public_ip
}

output "ec2_b_ip" {
  description = "IP pública de la instancia B (us-east-1b)"
  value       = aws_instance.app_b.public_ip
}

output "vpc_id" {
  description = "ID de la VPC creada"
  value       = aws_vpc.main.id
}

output "instrucciones" {
  description = "Pasos post-deploy"
  value       = <<-EOT
    ============================================================
    DEPLOY COMPLETADO — sistema-atencion-qr
    ============================================================
    URL de la app:       http://${aws_lb.main.dns_name}
    Login (usuario semilla): RUT 11111111-1 / Admin123!
    RDS endpoint:        ${aws_db_instance.postgres.address} (aun NO conectado a la app)
    EC2-A (1a):          ${aws_instance.app_a.public_ip}
    EC2-B (1b):          ${aws_instance.app_b.public_ip}

    PRÓXIMOS PASOS:
    1. Esperar ~5-8 min a que user_data clone el repo, instale Docker y
       levante docker-compose.prod.yml en ambas instancias (docker build
       de 6 imágenes toma la mayor parte de ese tiempo).
    2. Verificar los 6 target groups en AWS Console > EC2 > Target Groups
       (deben quedar "healthy" las dos instancias en cada uno).
    3. Abrir http://${aws_lb.main.dns_name} en el navegador y probar login.
    4. Para la demo de HA: detener una instancia (EC2-A o EC2-B) y
       recargar la URL — el ALB debe seguir sirviendo desde la otra.

    NOTA: cada instancia tiene su PROPIO Postgres local (RDS no está
    conectado todavía), así que un usuario creado en una instancia NO
    aparece si el ALB enruta la siguiente request a la otra. Válido
    para probar salud/HA de cada servicio, no para un flujo de negocio
    de punta a punta contra las dos instancias a la vez.

    RECUERDA: terraform destroy cuando termines la demo (el Lab tiene
    presupuesto fijo y la sesión expira sola de todas formas).
    ============================================================
  EOT
}
