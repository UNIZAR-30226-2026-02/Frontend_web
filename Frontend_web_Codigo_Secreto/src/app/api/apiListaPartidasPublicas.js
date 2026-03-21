/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * mediante API REST, referentes a la pantalla de lista de partidas públicas.
 */

const API_BASE_URL = "http://localhost:8080"; 

// Obtener los temas propios del jugador logueado. -> GET /api/jugadores/temas
export async function obtenerTemasJugador() {
  const response = await fetch(`${API_BASE_URL}/api/jugadores/temas`, {
    method: 'GET',
    credentials: 'include' // Necesario para enviar la cookie que contiene el JWT.
  });

  if (!response.ok) {
    throw new Error("Error al obtener los temas del jugador");
  }

  return response.json();
}

// Al pulsar el botón de UNIRSE, se envía esta información al backend.
export async function unirsePartidaPublica(idPartida) {
  const response = await fetch(`${API_BASE_URL}/api/partidas/${idPartida}/unirse/publica`, {
    method: 'POST',
    credentials: 'include' // Necesario para enviar la cookie que contiene el JWT.
  });

  if (!response.ok) {
    throw new Error("No se pudo unir a la partida");
  }

  // Si el backend devuelve algo (como el estado del lobby), podrías hacer return response.json()
  // Si devuelve un 200 OK vacío, con esto basta.
  return response.ok; 
}