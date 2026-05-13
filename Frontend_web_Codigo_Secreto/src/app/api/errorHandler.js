import { ERROR_CATALOG } from './errorCatalog';

let globalNavigate = null;
let globalShowToast = null;

/**
 * Permite configurar handlers globales para evitar pasarlos en cada llamada.
 */
export function setGlobalHandlers(navigate, showToast) {
  globalNavigate = navigate;
  globalShowToast = showToast;
}

/**
 * Utility para extraer el cuerpo del error y el mensaje descriptivo del backend.
 * Retorna { mensaje, errorCode, body }
 */
async function procesarRespuestaError(response, mensajeDefecto) {
  try {
    const errorBody = await response.json();
    const errorCode = errorBody.error_code || 'UNKNOWN';
    let mensaje = mensajeDefecto || ERROR_CATALOG["DEFAULT"];

    if (errorBody.error_code && ERROR_CATALOG[errorBody.error_code]) {
      mensaje = ERROR_CATALOG[errorBody.error_code];
    } else if (errorBody.details && typeof errorBody.details === 'object') {
      const detalles = Object.entries(errorBody.details)
        .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
        .join(', ');
      mensaje = `Error de validación: ${detalles}`;
    } else if (errorBody.message) {
      mensaje = errorBody.message;
    }

    return { mensaje, errorCode, body: errorBody };
  } catch {
    return { 
      mensaje: mensajeDefecto || ERROR_CATALOG["DEFAULT"], 
      errorCode: 'UNKNOWN', 
      body: {} 
    };
  }
}

/**
 * Utility para extraer mensajes de error descriptivos del backend.
 * Mantenemos la firma por compatibilidad si se usa en otros sitios, 
 * pero internamente debe clonar para no agotar el stream.
 */
export async function extraerMensajeError(response, mensajeDefecto) {
  const cloned = response.clone();
  const { mensaje } = await procesarRespuestaError(cloned, mensajeDefecto);
  return mensaje;
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
  const { mensaje, errorCode } = await procesarRespuestaError(response, mensajeDefecto);

  const finalShowToast = showToast || globalShowToast;
  const finalNavigate = navigate || globalNavigate;

  // Mostrar el error visualmente si el toast está disponible
  if (finalShowToast) {
    finalShowToast(mensaje, 'error');
  }
  
  // Si es un error de sesión, redirigir al login y limpiar token en client side
  const sessionErrors = ['SESSION_INVALIDATED', 'GOOGLE_TOKEN_EXPIRED', 'INACTIVE_ACCOUNT'];
  if (sessionErrors.includes(errorCode)) {
    sessionStorage.removeItem('jwt_token');
    
    // Si no había toast, al menos un alert para que el usuario sepa qué pasó
    if (!finalShowToast) {
      alert(mensaje);
    }
    
    if (finalNavigate) {
      // Si ya estamos en login, no navegar (evita loops)
      if (window.location.pathname !== '/login') {
        finalNavigate('/login');
      }
    } else {
      // Si ya estamos en login, no recargar (evita loops)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }
  
  throw new Error(mensaje);
}

/**
 * Crea un objeto Error con el mensaje descriptivo del backend.
 */
export async function crearErrorDescriptivo(response, mensajeDefecto) {
  const { mensaje, errorCode } = await procesarRespuestaError(response, mensajeDefecto);
  const error = new Error(mensaje);
  error.status = response.status;
  error.code = errorCode;
  return error;
}
