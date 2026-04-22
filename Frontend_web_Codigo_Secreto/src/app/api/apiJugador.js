/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * referentes al perfil y la gestión de datos de usuarios y personalización del tablero.
 */

const BASE_URL = import.meta.env.VITE_API_URL;
 

// Obtener perfil del jugador autenticado → GET /api/jugadores
export async function obtenerPerfil() {
  const res = await fetch(`${BASE_URL}/jugadores`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'No se pudo cargar tu perfil');
  }
  return res.json();
}

// Actualizar tag y foto de perfil → PUT /api/jugadores
export async function actualizarPerfil({ tag, foto_perfil }) {
  const body = {};
  if (tag !== undefined) body.tag = tag;
  if (foto_perfil !== undefined) body.foto_perfil = foto_perfil;
 
  const res = await fetch(`${BASE_URL}/jugadores`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
 
  if (res.status === 400) {
    throw new Error('TAG_DUPLICADO');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'No se pudo actualizar tu perfil');
  }
  return res.json();
}

// Historial de partidas → GET /api/jugadores/historial
export async function obtenerHistorial() {
  const res = await fetch(`${BASE_URL}/jugadores/historial`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'No se pudo cargar tu historial de partidas');
  }
  return res.json();
}
 
// RF-5: Logros del jugador → GET /api/jugadores/logros
export async function obtenerLogros() {
  const res = await fetch(`${BASE_URL}/jugadores/logros`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'No se pudieron cargar tus logros');
  }
  return res.json();
}
 
// Personalizaciones del jugador → GET /api/jugadores/personalizaciones
export async function obtenerPersonalizaciones() {
  const res = await fetch(`${BASE_URL}/jugadores/personalizaciones`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'No se pudieron cargar tus personalizaciones');
  }
  return res.json();
}
 

// Equipar / desequipar personalización → PUT /api/jugadores/equipar
export async function equiparPersonalizacion(id_personalizacion, equipado) {
  const res = await fetch(`${BASE_URL}/jugadores/equipar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_personalizacion, equipado }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'No se pudo equipar la personalización');
  }
  return res.json();
}