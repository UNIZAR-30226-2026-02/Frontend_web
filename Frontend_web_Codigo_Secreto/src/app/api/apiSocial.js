/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * referentes a amigos y leaderboard.
 */

const BASE_URL = 'http://localhost:8080/api';

// Lista de amigos → GET /api/amigos
export async function obtenerAmigos() {
  const res = await fetch(`${BASE_URL}/amigos`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener amigos');
  return res.json(); // Array: { id_amigo, tag, foto_perfil, victorias, num_aciertos }
}

// Solicitudes de amistad pendientes → GET /api/amigos/solicitudes
export async function obtenerSolicitudes() {
  const res = await fetch(`${BASE_URL}/amigos/solicitudes`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener solicitudes');
  return res.json();
}

// RF-24: Buscar jugadores por tag → GET /api/jugadores/buscar?tag=...
export async function buscarJugadores(tag) {
  const res = await fetch(`${BASE_URL}/jugadores/buscar?tag=${encodeURIComponent(tag)}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al buscar jugadores');
  return res.json(); // Array: { id_google, tag, foto_perfil }
}

// Enviar solicitud de amistad → POST /api/amigos/solicitudes
export async function enviarSolicitudAmistad(id_receptor) {
  const res = await fetch(`${BASE_URL}/amigos/solicitudes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_receptor }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al enviar solicitud');
  }
  return res.json();
}


// Aceptar o rechazar solicitud → PUT /api/amigos/solicitudes
export async function responderSolicitud(id_solicitante, estado) {
  // estado: "aceptada" | "rechazada"
  const res = await fetch(`${BASE_URL}/amigos/solicitudes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_solicitante, estado }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al responder solicitud');
  }
  return res.json();
}


// Leaderboard global (top 10) → GET /api/leaderboard/global
export async function obtenerLeaderboardGlobal() {
  const res = await fetch(`${BASE_URL}/leaderboard/global`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener el leaderboard global');
  return res.json(); // Array: { tag, foto_perfil, victorias, num_aciertos }
}

// RF-25: Leaderboard de amigos → GET /api/leaderboard/amigos
export async function obtenerLeaderboardAmigos() {
  const res = await fetch(`${BASE_URL}/leaderboard/amigos`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener el leaderboard de amigos');
  return res.json();
}