const BASE_URL = 'http://localhost:8080/api';

// Obtener temas activos (para el selector de la Pantalla12CrearPartida)
export async function obtenerTemasActivos() {
  const res = await fetch(`${BASE_URL}/temas/activos`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener temas');
  return res.json();
}

// RF-12: Crear partida -> POST /api/partidas
export async function crearPartida(datos) {
  const res = await fetch(`${BASE_URL}/partidas`, {
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

// RF-12: Listar partidas públicas -> GET /api/partidas/publicas
export async function listarPartidasPublicas() {
  const res = await fetch(`${BASE_URL}/partidas/publicas`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener partidas públicas');
  return res.json(); // List<LobbyStatusDTO>
}

// RF-12: Unirse a partida -> POST /api/partidas/{id}/unirse
// codigoPartida es null para partidas públicas
export async function unirsePartida(idPartida, codigoPartida = null) {
  const body = codigoPartida ? { codigoPartida } : {};
  const res = await fetch(`${BASE_URL}/partidas/${idPartida}/unirse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al unirse a la partida');
  }
  return res.json(); // JugadorPartidaDTO
}

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