const { BlobServiceClient, BlobSASPermissions } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING no está definida en el entorno. Configúrala en el .env antes de arrancar el servicio.');
}

const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'qr-codes';

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

// Vigencia larga: el QR debe seguir siendo descargable mientras la cita exista.
const SAS_EXPIRY_YEARS = 10;

/**
 * Asegura que el container exista. Se llama una vez al arrancar el servicio
 * (ver server.js), antes de aceptar requests. No se pide acceso público al
 * container: muchas cuentas de Azure lo bloquean a nivel de cuenta
 * (PublicAccessNotPermitted, política de seguridad organizacional habitual).
 * En vez de depender de eso, uploadQRImage firma cada blob individualmente (SAS).
 */
const inicializarBlobStorage = async () => {
    await containerClient.createIfNotExists();
};

/**
 * Sube un buffer de imagen y devuelve una URL firmada (SAS) de solo lectura,
 * descargable sin exponer el container completo ni la cuenta a acceso público.
 */
const uploadQRImage = async (buffer, filename) => {
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: 'image/png' }
    });

    const expiresOn = new Date();
    expiresOn.setFullYear(expiresOn.getFullYear() + SAS_EXPIRY_YEARS);

    return blockBlobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse('r'),
        expiresOn
    });
};

module.exports = {
    inicializarBlobStorage,
    uploadQRImage
};
