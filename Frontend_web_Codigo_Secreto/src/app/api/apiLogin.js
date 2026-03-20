/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * referentes al login y registro de usuarios.
 */

// TODO: cambiar a URL segura con HTTPS.
const BASE_URL = 'http://localhost:8080/api';

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

// RF-XX: Desactivar cuenta -> POST /api/auth/desactivar

