/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * usando WebSockets, relativas a la partida de social (leaderboards y amigos).
 */

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/ws';

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