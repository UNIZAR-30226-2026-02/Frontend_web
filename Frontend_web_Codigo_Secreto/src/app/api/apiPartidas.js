/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * mediante API REST, referentes a las partidas.
 */

import { handleErrorResponse } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_URL;

// Obtener TODOS los temas activos del sistema (para el selector de la Pantalla12CrearPartida)
export async function obtenerTemasActivos(navigate = null) {
  const res = await fetch(`${BASE_URL}/temas/activos`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'Error al obtener los temas disponibles');
  }
  return res.json();
}

// Obtener los temas propios del jugador logueado. -> GET /api/jugadores/temas
export async function obtenerTemasJugador(navigate = null) {
  const response = await fetch(`${BASE_URL}/jugadores/temas`, {
    method: 'GET',  
    credentials: 'include' // Necesario para enviar la cookie que contiene el JWT.
  });

  if (!response.ok) {
    return handleErrorResponse(response, navigate, "No se pudo obtener tus temas guardados");
  }

  return response.json();
}

// Obtener TODAS las partidas públicas en estado 'esperando'. -> GET /api/partidas/publicas
export async function obtenerPartidasPublicas(navigate = null) {
  const response = await fetch(`${BASE_URL}/partidas/publicas`, {
    method: 'GET',  
    credentials: 'include' // Necesario para enviar la cookie que contiene el JWT.
  });

  if (!response.ok) {
    return handleErrorResponse(response, navigate, "No se pudieron cargar las partidas públicas disponibles");
  }

  return response.json();
}

// -------------- ESTADO DE LA PARTIDA --------------

// Obtener el estado actual de una partida ("esperando", "en_curso" o "finalizada")
// -> GET /api/partidas/{id_partida}/situacion
export async function obtenerEstadoPartida(idPartida, navigate = null) {
  const response = await fetch(`${BASE_URL}/partidas/${idPartida}/situacion`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    return handleErrorResponse(response, navigate, 'No se pudo obtener el estado de la partida');
  }

  const data = await response.json();
  return data.estado; // Devuelve directamente el string del estado ("esperando", "en_curso" o "finalizada")
}

// -------------- CREACIÓN DE PARTIDA --------------

// RF-12: Crear partida -> POST /api/partidas
export async function crearPartida(datos, navigate = null) {
  const res = await fetch(`${BASE_URL}/partidas/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo crear la partida');
  }
  return res.json(); // LobbyStatusDTO
}

// -----------------------------------------------------

// -------------- LISTA PARTIDAS PÚBLICAS --------------

// Al pulsar el botón de UNIRSE, se envía esta información al backend.
export async function unirsePartidaPublica(idPartida, navigate = null) {
  const response = await fetch(`${BASE_URL}/partidas/${idPartida}/unirse/publica`, {
    method: 'POST',
    credentials: 'include' // Necesario para enviar la cookie que contiene el JWT.
  });

  if (!response.ok) {
    return handleErrorResponse(response, navigate, "No se pudo unir a esta partida. Es posible que esté llena o ya haya comenzado");
  }

  return response.ok; 
}

// POST /api/partidas/{codigo}/unirse/privada
// Función para unirse a una partida privada a partir de su código único.
export async function unirsePartidaPrivada(codigo, navigate = null) {
  const res = await fetch(`${BASE_URL}/partidas/${codigo}/unirse/privada`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'Código de partida inválido o expirado');
  }
  const id = await res.json();
  return { id_partida: id };
}
// -----------------------------------------------------

// -------------- FIN DE PARTIDA --------------

// Abandonar una partida --> DELETE /api/partidas/{id_partida}/participantes
export async function abandonarPartida(idPartida, navigate = null) {
  const res = await fetch(`${BASE_URL}/partidas/${idPartida}/participantes`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo abandonar la partida');
  }
  return res.ok;
}

// Obtener los resultados finales de una partida -> GET /api/partida/{id_partida}/fin
export async function obtenerResultadosPartida(idPartida, navigate = null) {
  const response = await fetch(`${BASE_URL}/partida/${idPartida}/fin`, {
    method: 'GET',
    credentials: 'include' // Para que el backend pueda saber quién hace la petición.
  });

  if (!response.ok) {
    return handleErrorResponse(response, navigate, "No se pudieron cargar los resultados de la partida");
  }

  return response.json();
}

// RF-21: Elegir equipo -> PUT /api/partidas/{id}/equipo
export async function elegirEquipo(idPartida, equipo, navigate = null) {
  const res = await fetch(`${BASE_URL}/partidas/${idPartida}/equipo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ equipo }),
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo cambiar el equipo');
  }
  return res.json();
}
