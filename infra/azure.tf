# =============================================================
# Azure — Storage Account "qrmulticloud" / container "contenedorqr"
# Ya existen (creados a mano en el portal). Este archivo los define
# para poder traerlos bajo IaC con `terraform import`, SIN recrearlos.
#
# IMPORTANTE — no se pudo intentar el import en esta sesión:
# el provider azurerm gestiona recursos vía Azure Resource Manager
# (ARM), que requiere credenciales distintas a la connection string /
# access key que ya tenemos (esa es para el plano de datos — subir/
# bajar blobs — no para el plano de control ARM). Se necesita una de:
#   a) `az login` (Azure CLI) — no está instalado en esta máquina, o
#   b) un Service Principal (ARM_CLIENT_ID, ARM_CLIENT_SECRET,
#      ARM_TENANT_ID, ARM_SUBSCRIPTION_ID) — no configurado.
# Ver el informe de esta iteración para el detalle y los comandos
# exactos a correr una vez se tenga alguna de las dos.
# =============================================================

provider "azurerm" {
  features {}
  # Sin bloque de credenciales explícito: azurerm toma az CLI login o
  # las variables de entorno ARM_* estándar, igual que aws toma las suyas.
  subscription_id = var.azure_subscription_id
}

variable "azure_subscription_id" {
  description = "Subscription ID de Azure donde vive qrmulticloud (Portal > Subscriptions)"
  type        = string
  default     = ""
}

variable "azure_resource_group_name" {
  description = "Resource group donde vive la Storage Account qrmulticloud (Portal > Storage Account > Overview > Resource group)"
  type        = string
  default     = ""
}

# Definición que representa el recurso YA EXISTENTE. Los valores de
# account_tier/replication_type son el default más común para una
# cuenta creada a mano desde el portal (Standard/LRS); si el import
# reporta otros valores, hay que ajustarlos aquí para que el plan
# posterior quede sin diffs.
resource "azurerm_storage_account" "qrmulticloud" {
  name                     = "qrmulticloud"
  resource_group_name      = var.azure_resource_group_name
  location                 = "eastus"
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "contenedorqr" {
  name                  = "contenedorqr"
  storage_account_name  = azurerm_storage_account.qrmulticloud.name
  container_access_type = "private"
}
