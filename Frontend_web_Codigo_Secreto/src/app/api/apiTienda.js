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

import { crearErrorDescriptivo } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_URL;


// Catálogo de temas/packs → GET /api/temas/activos
// Retorna Array: { id_tema, nombre, descripcion, precio_balas, comprado }

export async function obtenerTemasActivos() {
  const res = await fetch(`${BASE_URL}/temas/activos`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw await crearErrorDescriptivo(res, 'No se pudo cargar el catálogo de temas');
  return res.json();
}

// Inventario de personalizaciones del jugador → GET /api/jugadores/personalizaciones
// Retorna Array: { id_personalizacion, nombre, tipo, valor_visual, equipado, comprado }
export async function obtenerPersonalizacionesJugador() {
  const res = await fetch(`${BASE_URL}/personalizaciones/activas`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw await crearErrorDescriptivo(res, 'No se pudieron cargar las personalizaciones');
  return res.json();
}


// Comprar paquete de cartas → POST /api/tienda/comprar/tema
// Envía:   { id_tema }
// Retorna: { balas }   ← saldo restante
export async function comprarTema(id_tema) {
  const res = await fetch(`${BASE_URL}/tienda/comprar/tema`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_tema }),
  });
  if (!res.ok) {
    throw await crearErrorDescriptivo(res, 'No se pudo comprar el paquete de cartas');
  }
  return res.json();
}

// Comprar personalización → POST /api/tienda/comprar/personalizacion
// Envía:   { id_personalizacion }
// Retorna: { balas }   ← saldo restante
export async function comprarPersonalizacion(id_personalizacion) {
  const res = await fetch(`${BASE_URL}/tienda/comprar/personalizacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_personalizacion }),
  });
  if (!res.ok) {
    throw await crearErrorDescriptivo(res, 'No se pudo comprar la personalización');
  }
  return res.json();
}

// Equipar / desequipar personalización → PUT /api/personalizaciones/equipar
// Envía:   { id_personalizacion, equipado }

export async function equiparPersonalizacion(id_personalizacion, equipado) {
  const res = await fetch(`${BASE_URL}/jugadores/equipar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_personalizacion, equipado }),
  });
  if (!res.ok) {
    throw await crearErrorDescriptivo(res, 'No se pudo equipar la personalización');
  }
  return res.json();
}