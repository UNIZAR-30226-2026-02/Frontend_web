/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * referentes a amigos y leaderboard.
 */

import { crearErrorDescriptivo } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_URL;

// Lista de amigos → GET /api/amigos
export async function obtenerAmigos() {
  const res = await fetch(`${BASE_URL}/amigos`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw await crearErrorDescriptivo(res, 'No se pudo cargar tu lista de amigos');
  return res.json();
}

// Solicitudes de amistad pendientes → GET /api/amigos/solicitudes
export async function obtenerSolicitudes() {
  const res = await fetch(`${BASE_URL}/amigos/solicitudes`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw await crearErrorDescriptivo(res, 'No se pudieron cargar las solicitudes de amistad');
  return res.json();
}

// RF-24: Buscar jugadores por tag → GET /api/jugadores/buscar?tag=...
export async function buscarJugadores(tag) {
  const res = await fetch(`${BASE_URL}/jugadores/buscar?tag=${encodeURIComponent(tag)}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw await crearErrorDescriptivo(res, 'No se encontraron jugadores con ese nombre');
  return res.json();
}

// Enviar solicitud de amistad → POST /api/amigos/solicitudes
export async function enviarSolicitudAmistad(tag_receptor) {
  const res = await fetch(`${BASE_URL}/amigos/solicitudes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ tag_receptor }),
  });
  if (!res.ok) {
    throw await crearErrorDescriptivo(res, 'No se pudo enviar la solicitud de amistad');
  }
  return true;
}

// Aceptar o rechazar solicitud → PUT /api/amigos/solicitudes
export async function responderSolicitud(id_solicitante, estado) {
  const res = await fetch(`${BASE_URL}/amigos/solicitudes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_solicitante, estado }),
  });
  if (!res.ok) {
    throw await crearErrorDescriptivo(res, `No se pudo ${estado === 'aceptada' ? 'aceptar' : 'rechazar'} la solicitud`);
  }
  return true;
}

// Leaderboard global (top 10) → GET /api/leaderboard/global
export async function obtenerLeaderboardGlobal() {
  const res = await fetch(`${BASE_URL}/leaderboard/global`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw await crearErrorDescriptivo(res, 'No se pudo cargar el leaderboard global');
  return res.json();
}

// RF-25: Leaderboard de amigos → GET /api/leaderboard/amigos
export async function obtenerLeaderboardAmigos() {
  const res = await fetch(`${BASE_URL}/leaderboard/amigos`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw await crearErrorDescriptivo(res, 'No se pudo cargar el leaderboard de tus amigos');
  return res.json();
}