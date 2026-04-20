/**
 * Utility para extraer mensajes de error descriptivos del backend
 * El backend devuelve errores en la estructura:
 * {
 *   "message": "...",
 *   "error": "...",
 *   "details": { campo: "descripción" }  // para validaciones
 * }
 */

/**
 * Extrae un mensaje de error descriptivo de la respuesta del backend
 * @param {Response} response - Respuesta del fetch
 * @param {string} mensajeDefecto - Mensaje por defecto si no se puede extraer
 * @returns {Promise<string>} Mensaje de error descriptivo
 */
export async function extraerMensajeError(response, mensajeDefecto = 'Ocurrió un error inesperado') {
  try {
    const errorBody = await response.json();
    
    // Si hay detalles de validación, mostrar primero
    if (errorBody.details && typeof errorBody.details === 'object') {
      const detalles = Object.entries(errorBody.details)
        .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
        .join(', ');
      return `Error de validación: ${detalles}`;
    }
    
    // Si hay mensaje del backend, usarlo
    if (errorBody.message) {
      return errorBody.message;
    }
    
    // Si hay campo 'error', usarlo
    if (errorBody.error) {
      return errorBody.error;
    }
    
    // Fallback al mensaje por defecto
    return mensajeDefecto;
  } catch (e) {
    // Si no se puede parsear el JSON, devolver el mensaje por defecto
    return mensajeDefecto;
  }
}

/**
 * Crea un objeto Error con el mensaje descriptivo del backend
 * @param {Response} response - Respuesta del fetch
 * @param {string} mensajeDefecto - Mensaje por defecto
 * @returns {Promise<Error>}
 */
export async function crearErrorDescriptivo(response, mensajeDefecto) {
  const mensaje = await extraerMensajeError(response, mensajeDefecto);
  const error = new Error(mensaje);
  error.status = response.status;
  return error;
}
