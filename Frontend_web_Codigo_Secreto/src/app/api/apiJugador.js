/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * referentes al perfil y la gestión de datos de usuarios y personalización del tablero.
 */

import { handleErrorResponse } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_URL;
 

// Obtener perfil del jugador autenticado → GET /api/jugadores
export async function obtenerPerfil(navigate = null) {
  const res = await fetch(`${BASE_URL}/jugadores`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo cargar tu perfil');
  }
  return res.json();
}

// Actualizar tag y foto de perfil → PUT /api/jugadores
export async function actualizarPerfil({ tag, foto_perfil }, navigate = null) {
  const body = {};
  if (tag !== undefined) body.tag = tag;
  if (foto_perfil !== undefined) body.foto_perfil = foto_perfil;
 
  const res = await fetch(`${BASE_URL}/jugadores`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
 
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo actualizar tu perfil');
  }
  return res.json();
}

// Historial de partidas → GET /api/jugadores/historial
export async function obtenerHistorial(navigate = null) {
  const res = await fetch(`${BASE_URL}/jugadores/historial`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo cargar tu historial de partidas');
  }
  return res.json();
}
 
// RF-5: Logros del jugador → GET /api/jugadores/logros
export async function obtenerLogros(navigate = null) {
  const res = await fetch(`${BASE_URL}/jugadores/logros`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudieron cargar tus logros');
  }
  return res.json();
}
 
// Personalizaciones del jugador → GET /api/jugadores/personalizaciones
export async function obtenerPersonalizaciones(navigate = null) {
  const res = await fetch(`${BASE_URL}/jugadores/personalizaciones`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudieron cargar tus personalizaciones');
  }
  return res.json();
}
 

// Equipar / desequipar personalización → PUT /api/jugadores/equipar
export async function equiparPersonalizacion(id_personalizacion, equipado, navigate = null) {
  const res = await fetch(`${BASE_URL}/jugadores/equipar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_personalizacion, equipado }),
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo equipar la personalización');
  }
  // Manejar respuesta vacía (body vacío pero status 200)
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
