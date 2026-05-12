/*
 * Fichero con las funciones de comunicación con el backend para la tienda virtual.
 *
 * Contrato de API (versión definitiva):
 *  GET  /api/temas/activos                    → catálogo completo (comprado o no)
 *  GET  /api/jugadores/personalizaciones      → inventario de personalizaciones del jugador
 *  POST /api/tienda/comprar/tema              → comprar un paquete de cartas
 *  POST /api/tienda/comprar/personalizacion   → comprar una personalización
 *  PUT  /api/personalizaciones/equipar        → equipar una personalización
 */

import { handleErrorResponse } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_URL;


// Catálogo de temas/packs → GET /api/temas/activos
// Retorna Array: { id_tema, nombre, descripcion, precio_balas, comprado }

export async function obtenerTemasActivos(navigate = null, showToast = null) {
  const res = await fetch(`${BASE_URL}/temas/activos`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo cargar el catálogo de temas', showToast);
  }
  return res.json();
}

// Inventario de personalizaciones del jugador → GET /api/jugadores/personalizaciones
// Retorna Array: { id_personalizacion, nombre, tipo, valor_visual, equipado, comprado }
export async function obtenerPersonalizacionesJugador(navigate = null, showToast = null) {
  const res = await fetch(`${BASE_URL}/personalizaciones/activas`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudieron cargar las personalizaciones', showToast);
  }
  return res.json();
}


// Comprar paquete de cartas → POST /api/tienda/comprar/tema
// Envía:   { id_tema }
// Retorna: { balas }   ← saldo restante
export async function comprarTema(id_tema, navigate = null, showToast = null) {
  const res = await fetch(`${BASE_URL}/tienda/comprar/tema`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_tema }),
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo comprar el paquete de cartas', showToast);
  }
  return res.json();
}

// Comprar personalización → POST /api/tienda/comprar/personalizacion
// Envía:   { id_personalizacion }
// Retorna: { balas }   ← saldo restante
export async function comprarPersonalizacion(id_personalizacion, navigate = null, showToast = null) {
  const res = await fetch(`${BASE_URL}/tienda/comprar/personalizacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_personalizacion }),
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo comprar la personalización', showToast);
  }
  return res.json();
}

// Equipar / desequipar personalización → PUT /api/jugadores/equipar
// Envía:   { id_personalizacion, equipado }
export async function equiparPersonalizacion(id_personalizacion, equipado, navigate = null, showToast = null) {
  const res = await fetch(`${BASE_URL}/jugadores/equipar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_personalizacion, equipado }),
  });
  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo equipar la personalización', showToast);
  }
  // Manejar respuesta vacía (body vacío pero status 200)
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
