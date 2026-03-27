/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * mediante API REST, referentes a las partidas.
 */

const BASE_URL = 'http://localhost:8080/api';

// Obtener TODOS los temas activos del sistema (para el selector de la Pantalla12CrearPartida)
export async function obtenerTemasActivos() {
  const res = await fetch(`${BASE_URL}/temas/activos`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener temas');
  return res.json();
}

// Obtener los temas propios del jugador logueado. -> GET /api/jugadores/temas
export async function obtenerTemasJugador() {
  const response = await fetch(`${BASE_URL}/jugadores/temas`, {
    method: 'GET',  
    credentials: 'include' // Necesario para enviar la cookie que contiene el JWT.
  });

  if (!response.ok) {
    throw new Error("Error al obtener los temas del jugador");
  }

  return response.json();
}

// Obtener TODAS las partidas públicas en estado 'esperando'. -> GET /api/partidas/publicas
export async function obtenerPartidasPublicas() {
  const response = await fetch(`${BASE_URL}/partidas/publicas`, {
    method: 'GET',  
    credentials: 'include' // Necesario para enviar la cookie que contiene el JWT.
  });

  if (!response.ok) {
    throw new Error("Error al obtener las partidas públicas");
  }

  return response.json();
}

// -------------- CREACIÓN DE PARTIDA --------------

// RF-12: Crear partida -> POST /api/partidas
export async function crearPartida(datos) {
  const res = await fetch(`${BASE_URL}/partidas/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al crear partida');
  }
  return res.json(); // LobbyStatusDTO
}

// -----------------------------------------------------

// -------------- LISTA PARTIDAS PÚBLICAS --------------

// Al pulsar el botón de UNIRSE, se envía esta información al backend.
export async function unirsePartidaPublica(idPartida) {
  const response = await fetch(`${BASE_URL}/api/partidas/${idPartida}/unirse/publica`, {
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

// Añade esta función junto a las demás
export async function unirsePartidaPrivada(codigo) {
  const res = await fetch(`${BASE_URL}/partidas/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ codigo_partida: codigo })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Código de partida inválido');
  }
  return res.json(); // { id_partida, ... }
}
// -----------------------------------------------------

// -------------- FIN DE PARTIDA --------------

// Obtener los resultados finales de una partida -> GET /api/partida/{id_partida}/fin
export async function obtenerResultadosPartida(idPartida) {
  const response = await fetch(`${BASE_URL}/partida/${idPartida}/fin`, {
    method: 'GET',
    credentials: 'include' // Para que el backend pueda saber quién hace la petición.
  });

  if (!response.ok) {
    throw new Error("Error al obtener los resultados de la partida");
  }

  // Devuelve { aciertos_rojo, aciertos_azul, equipo_ganador }
  return response.json();
}
// -----------------------------------------------------

// TODO: revisar las funciones de aquí abajo

// RF-21: Elegir equipo -> PUT /api/partidas/{id}/equipo
// REQUIERE añadir este endpoint en el backend (ver instrucciones al final)
export async function elegirEquipo(idPartida, equipo) {
  const res = await fetch(`${BASE_URL}/partidas/${idPartida}/equipo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ equipo }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al elegir el equipo');
  }
  return res.json(); // JugadorPartidaDTO actualizado
}