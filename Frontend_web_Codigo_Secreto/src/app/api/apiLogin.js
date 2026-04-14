/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * referentes al login y registro de usuarios.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

// RF-02: Login con Google -> POST /api/auth/login
// Enviar el id de Google del usuario al backend y devolver la respuesta.
export async function loginConGoogle(idToken) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // IMPORTANTÍSIMO: Necesario para que el navegador guarde la cookie HttpOnly
    // que recibirá el frontend con el JWT (por el CORS).
    credentials: "include", 
    // Aunque el DTO del backend utiliza Camel Case (idGoogle), se ha configurado
    // Jackson para que reciba Snake_case (id_google).
    body: JSON.stringify({ id_google: idToken }) 
  });

  // TODO: comprobar qué status devuelve el backend si detecta un intento de doble sesión.
  // El backend notifica de que ese usuario ya tiene una sesión iniciada en otro dispositivo.
  if(res.status === 409){
    throw new Error('Ya tiene una sesión abierta en otro dispositivo');
  }

  // Comprueba si hay algún otro error.
  if (!res.ok) {
    // Intentamos extraer el mensaje de error del backend, si no, uno genérico
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al autenticar con el servidor');
  }

  // Retornará un objeto: { esNuevo: boolean, jwt?: string, jugador?: object }
  return res.json();
}

// RF-01: Registro de nuevo usuario -> POST /api/auth/registro
// Enviar el id de Google del usuario y su tag al backend y devolver la respuesta.
export async function registroNuevoUsuario(idToken, tag) {
  const res = await fetch(`${BASE_URL}/auth/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
    // Se envían los datos al backend en el JSON.
    body: JSON.stringify({ id_google: idToken, tag: tag }) 
  });

  if (!res.ok) {

    if (res.status === 409) {
        // Caso de conflicto: Ese Tag ya lo tiene otro jugador
        throw new Error("TAG_DUPLICADO");
      }

    // Intentamos extraer el mensaje de error del backend, si no, uno genérico
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al autenticar con el servidor. Inténtelo de nuevo.');
  }

  // Retornará un objeto: { jwt: string, jugador: object }. NO DEVUELVE EL 'status'.
  return res.json();
}


// RF-XX: Logout -> POST /api/auth/logout
// Invalida la sesión del usuario en el servidor y pide al navegador que destruya la cookie.
export async function logoutUsuario() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include" // Necesario para enviar la cookie actual y que el backend sepa a quién desloguear
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al cerrar sesión en el servidor.');
  }

  // TODO: revisar lo que devuelve el backend.
  return res.ok; 
}

// RF-XX: Desactivar cuenta -> POST /api/auth/desactivar
// Desactiva la cuenta del usuario autenticado y restablece sus valores por defecto.
export async function desactivarCuentaUsuario() {
  const res = await fetch(`${BASE_URL}/auth/desactivar`, {
    method: "PUT",
    credentials: "include" // Necesario para enviar la cookie y que el backend sepa a quién desactivar
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al desactivar la cuenta en el servidor.');
  }

  // TODO: revisar lo que devuelve el backend.
  return res.ok; 
}

