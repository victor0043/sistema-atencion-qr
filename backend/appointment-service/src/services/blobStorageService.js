const { BlobServiceClient } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING no está definida en el entorno. Configúrala en el .env antes de arrancar el servicio.');
}

const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'qr-codes';

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

/**
 * Asegura que el container exista. Se llama una vez al arrancar el servicio
 * (ver server.js), antes de aceptar requests. Acceso público a nivel de blob
 * para que la URL guardada en la cita sea directamente descargable (el QR
 * está pensado para que el paciente lo vea, no es información sensible).
 */
const inicializarBlobStorage = async () => {
    await containerClient.createIfNotExists({ access: 'blob' });
};

/**
 * Sube un buffer de imagen y devuelve la URL pública del blob.
 */
const uploadQRImage = async (buffer, filename) => {
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: 'image/png' }
    });

    return blockBlobClient.url;
};

module.exports = {
    inicializarBlobStorage,
    uploadQRImage
};
