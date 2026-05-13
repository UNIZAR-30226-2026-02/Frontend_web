import { ERROR_CATALOG } from './errorCatalog';

/**
 * Utility para extraer mensajes de error descriptivos del backend.
 */
export async function extraerMensajeError(response, mensajeDefecto) {
  try {
    const errorBody = await response.json();
    
    if (errorBody.error_code && ERROR_CATALOG[errorBody.error_code]) {
      return ERROR_CATALOG[errorBody.error_code];
    }

    if (errorBody.details && typeof errorBody.details === 'object') {
      const detalles = Object.entries(errorBody.details)
        .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
        .join(', ');
      return `Error de validación: ${detalles}`;
    }
    
    if (errorBody.message) {
      return errorBody.message;
    }
    
    return mensajeDefecto || ERROR_CATALOG["DEFAULT"];
  } catch (err) {
    return mensajeDefecto || "Error desconocido";
  }
}

/**
 * Maneja una respuesta de error del backend, extrayendo el mensaje y enviándolo a un Toast.
 * 
 * @param {Response} response - Respuesta del fetch
 * @param {function} navigate - Función de navegación (opcional)
 * @param {string} mensajeDefecto - Mensaje por defecto
 * @param {function} showToast - Función del ToastContext (opcional)
 * @returns {Promise<never>} Lanza un Error
 */
export async function handleErrorResponse(response, navigate = null, mensajeDefecto = "", showToast = null) {
  const mensaje = await extraerMensajeError(response, mensajeDefecto);
  
  let errorCode = 'UNKNOWN';
  try {
    const body = await response.clone().json();
    errorCode = body.error_code || 'UNKNOWN';
  } catch (e) {}

  // Mostrar el error visualmente si showToast está disponible
  if (showToast) {
    showToast(mensaje, 'error');
  }
  
  // Si es un error de sesión, redirigir al login y limpiar token en client side
  const sessionErrors = ['SESSION_INVALIDATED', 'GOOGLE_TOKEN_EXPIRED', 'INACTIVE_ACCOUNT'];
  if (sessionErrors.includes(errorCode)) {
    sessionStorage.removeItem('jwt_token');
    if (showToast) {
      showToast(mensaje, 'error');
    } else {
      alert(mensaje);
    }
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
  }
  
  throw new Error(mensaje);
}

/**
 * Crea un objeto Error con el mensaje descriptivo del backend.
 */
export async function crearErrorDescriptivo(response, mensajeDefecto) {
  const mensaje = await extraerMensajeError(response, mensajeDefecto);
  const error = new Error(mensaje);
  error.status = response.status;
  try {
    const body = await response.clone().json();
    error.code = body.error_code;
  } catch (e) {
    error.code = 'UNKNOWN';
  }
  return error;
}
