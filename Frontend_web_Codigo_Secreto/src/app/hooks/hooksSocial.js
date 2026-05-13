/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * usando WebSockets, relativas a la partida de social (leaderboards y amigos).
 */

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL;

// Suscripciones de un único cliente a todos los canales de WebSockets del apartado de 
// Social.
// PARA LA LISTA DE AMIGOS EN TIEMPO REAL (Pestaña "Amigos")
// PARA LEADERBOARDS EN TIEMPO REAL (Pestaña "CLASIFICACIÓN")
export function useSocialWebSockets(onAmigosActualizados, onGlobalActualizado,
  onAmigosLeaderboardActualizado, onSolicitudesActualizadas, onError, token) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Creación de un único cliente STOMP para todas las suscripciones de WebSockets.
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        console.log('Conectado a la central: Actualizaciones Sociales y Clasificaciones');
        
        // Suscripción Lista de Amigos (Pestaña Amigos)
        client.subscribe('/user/queue/amigos', (msg) => {
          try {
            const data = JSON.parse(msg.body);
            // 'data' será el array actualizado: [{tag, foto_perfil, victorias, num_aciertos}, ...]
            onAmigosActualizados(data);
          } catch (err) {
            console.error('Error al descifrar la lista de amigos:', err);
            if (onError) onError('Error al descifrar la transmisión de contactos.');
          }
        });

        // Suscripción Broadcast Leaderboard (Global)
        client.subscribe('/topic/leaderboard/global', (msg) => {
          try {
            const data = JSON.parse(msg.body);
            onGlobalActualizado(data);
          } catch (err) {
            console.error('Error al descifrar el ranking global:', err);
            if (onError) onError('Error al descifrar el ranking global.');
          }
        });

        // Suscripción canal personal Leaderboard (Amigos)
        client.subscribe('/user/queue/leaderboard/amigos', (msg) => {
          try {
            const data = JSON.parse(msg.body);
            onAmigosLeaderboardActualizado(data);
          } catch (err) {
            console.error('Error al descifrar el ranking de amigos:', err);
            if (onError) onError('Error al descifrar el ranking de amigos.');
          }
        });

        // Suscripción canal personal Solicitudes
        client.subscribe('/user/queue/solicitudes', (msg) => {
          try {
            const data = JSON.parse(msg.body);
            // 'data' será el array actualizado de solicitudes pendientes
            onSolicitudesActualizadas(data);
          } catch (err) {
            console.error('Error al descifrar las solicitudes:', err);
            if (onError) onError('Error al descifrar las solicitudes pendientes.');
          }
        });
      },
      onStompError: (frame) => {
        if (frame.headers?.message === "SESSION_INVALIDATED") {
          window.location.href = "/login";
          return;
        }
        console.error('STOMP error:', frame);
        if (onError) onError('Conexión perdida con la central de comunicaciones.');
      },
      onWebSocketError: (event) => {
        console.error('WS error:', event);
        if (onError) onError('Los canales de comunicación están caídos.');
      }
    });

    client.activate();
    clientRef.current = client;

    // Desconexión limpia al salir de la pantalla
    return () => client.deactivate();
  }, [onAmigosActualizados, onGlobalActualizado, onAmigosLeaderboardActualizado, onError, token]);

  return clientRef;
}

// PARA LAS NOTIFICACIONES PERSONALES (Global a toda la app)

// El parámetro 'onNotificacionRecibida' se ejecuta cada vez que el backend envía 
// una nueva notificación (tipo, payload) para actualizar el badge.
export function useNotificacionesSociales(onNotificacionRecibida, onError, token) {
  const clientRef = useRef(null);

  useEffect(() => {

    // Si no hay token (usuario no logueado o ha cerrado sesión), se aborta la conexión.
    // Si ya había un cliente conectado, el return del useEffect anterior lo limpiará.
    if (!token) return;

    // Creación del cliente STOMP.
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        console.log('Conectado a la central: Notificaciones Sociales');
        
        // Suscribirse al canal personal para escuchar notificaciones.
        // TODO: revisar si el backend hace broadcast (/topic) o envía a las conexiones 
        // específicas de cada usuario (/user/queue).
        client.subscribe('/user/queue/jugadores/notificaciones', (msg) => {
          try {
            const data = JSON.parse(msg.body);
            // 'data' tendrá la estructura: { tipo: , payload: {...} }
            // El 'tipo' puede ser "solicitud_amistad" o "logro_desbloqueado" o 
            // "medalla_desbloqueada".
            onNotificacionRecibida(data);
          } catch (err) {
            console.error('Error al descifrar la notificación:', err);
            if (onError) onError('Error al descifrar la notificación entrante.');
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error en notificaciones:', frame);
        if (onError) onError('Conexión perdida con la central de notificaciones.');
      },
      onWebSocketError: (event) => {
        console.error('WS error en notificaciones:', event);
        if (onError) onError('Los canales de comunicación sociales están caídos.');
      }
    });

    client.activate();
    clientRef.current = client;

    // Desconexión limpia al salir de la aplicación o cerrar sesión
    return () => client.deactivate();
  }, [onNotificacionRecibida, onError, token]);

  return clientRef;
}