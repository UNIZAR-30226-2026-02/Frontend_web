import { ERROR_CATALOG } from './errorCatalog';

/**
 * Utility para extraer mensajes de error descriptivos del backend.
 * El backend devuelve errores en la estructura:
 * {
 *   "status": 4xx/5xx,
 *   "error_code": "CODE_NAME",
 *   "message": "...",
 *   "details": { campo: "descripción" }  // para validaciones
 * }
 */

/**
 * Extrae un mensaje de error descriptivo de la respuesta del backend.
 * Prioriza el código de error definido en el contrato (error_code).
 * 
 * @param {Response} response - Respuesta del fetch
 * @param {string} mensajeDefecto - Mensaje por defecto si no se puede extraer
 * @returns {Promise<string>} Mensaje de error descriptivo
 */
export async function extraerMensajeError(response, mensajeDefecto) {
  try {
    // Clonamos la respuesta para poder leer el JSON sin agotar el body original
    // por si fuera necesario volver a leerlo fuera de esta función.
    const errorBody = await response.json();
    
    // 1. Prioridad: Código de error catalogado (Sección 9 del contrato)
    if (errorBody.error_code && ERROR_CATALOG[errorBody.error_code]) {
      return ERROR_CATALOG[errorBody.error_code];
    }

    // 2. Si hay detalles de validación (campos específicos)
    if (errorBody.details && typeof errorBody.details === 'object') {
      const detalles = Object.entries(errorBody.details)
        .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
        .join(', ');
      return `Error de validación: ${detalles}`;
    }
    
    // 3. Si hay un mensaje explícito del backend (aunque no esté en el catálogo)
    if (errorBody.message) {
      return errorBody.message;
    }
    
    // 4. Fallback: mensajeDefecto pasado o el genérico del catálogo
    return mensajeDefecto || ERROR_CATALOG["DEFAULT"];

  } catch (e) {
    // Si no se puede parsear el JSON (ej: error 502 Bad Gateway que devuelve HTML)
    return mensajeDefecto || ERROR_CATALOG["DEFAULT"];
  }
}

/**
 * Crea un objeto Error con el mensaje descriptivo del backend.
 * @param {Response} response - Respuesta del fetch
 * @param {string} mensajeDefecto - Mensaje por defecto
 * @returns {Promise<Error>}
 */
export async function crearErrorDescriptivo(response, mensajeDefecto) {
  const mensaje = await extraerMensajeError(response, mensajeDefecto);
  const error = new Error(mensaje);
  error.status = response.status;
  
  // Intentamos adjuntar el código original por si el llamador quiere lógica extra
  try {
    const body = await response.clone().json();
    error.code = body.error_code;
  } catch (e) {
    error.code = 'UNKNOWN';
  }
  
  return error;
}
