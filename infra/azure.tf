# =============================================================
# Azure — Storage Account "qrmulticloud" / container "contenedorqr"
# Ya existen (creados a mano en el portal). Este archivo los define
# para poder traerlos bajo IaC con `terraform import`, SIN recrearlos.
# =============================================================

provider "azurerm" {
  features {}
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

############################################################
# Storage Account (YA EXISTE)
############################################################

resource "azurerm_storage_account" "qrmulticloud" {
  name                     = "qrmulticloud"
  resource_group_name      = var.azure_resource_group_name
  location                 = "eastus"
  account_tier             = "Standard"
  account_replication_type = "LRS"

  allow_nested_items_to_be_public  = true
  cross_tenant_replication_enabled = true
}

############################################################
# Blob Container
############################################################

resource "azurerm_storage_container" "contenedorqr" {
  name                  = "contenedorqr"
  storage_account_name  = azurerm_storage_account.qrmulticloud.name
  container_access_type = "private"
}
