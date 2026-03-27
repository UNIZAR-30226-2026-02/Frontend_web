/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * usando WebSockets, relativas a las partidas.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/ws';

//PARA LAS MISIONES PÚBLICAS

// El parámetro 'onMisionesRecibidas' es donde el backend pone el estado inicial de todas
// las partidas públicas para que las pinte el frontend, y donde pone la información 
// actualizada cada vez que se hace un publish.
export function usePartidasPublicas(onMisionesRecibidas, onError) {
  const clientRef = useRef(null);

  useEffect(() => {
    const token = sessionStorage.getItem('jwt_token'); // Recuperar el token del usuario actual del sessionStorage.

    // Creación del cliente STOMP.
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        console.log('Conectado a la central: Misiones Públicas');
        
        // Nos suscribimos al canal para escuchar futuros cambios. 
        client.subscribe('/topic/partidas/publicas', (msg) => {
          try {
            const data = JSON.parse(msg.body);
            onMisionesRecibidas(data);
          } catch (err) {
            console.error('Error al descifrar las misiones:', err);
            if (onError) onError('Error al descifrar la transmisión.');
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error en partidas públicas:', frame);
        if (onError) onError('Conexión perdida con la central.');
      },
      onWebSocketError: (event) => {
        console.error('WS error en partidas públicas:', event);
        if (onError) onError('Los canales de comunicación están caídos.');
      }
    });

    client.activate();
    clientRef.current = client;

    // Desconexión limpia al salir de la pantalla
    return () => client.deactivate();
  }, [onMisionesRecibidas, onError]);

  return clientRef;
}

// TODO: revisar las funciones de aquí abajo.

//PARA EL LOBBY

export function useLobbyWebSocket(idPartida, onLobbyUpdate, onPartidaIniciada) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!idPartida) return;

    const token = sessionStorage.getItem('jwt_token');

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/topic/partidas/${idPartida}/lobby`, (msg) => {
          onLobbyUpdate(JSON.parse(msg.body));
        });
        client.subscribe(`/topic/partidas/${idPartida}/inicio`, (msg) => {
          onPartidaIniciada(JSON.parse(msg.body));
        });
      },
      onStompError: (frame) => console.error('STOMP lobby error:', frame),
    });

    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [idPartida]);

  return clientRef;
}


//PARA EL CHAT

export function useChatEquipo(idPartida, equipo, onMensaje) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!idPartida || !equipo) return;

    const token = sessionStorage.getItem('jwt_token');

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(
          `/topic/partidas/${idPartida}/chat/${equipo.toLowerCase()}`,
          (msg) => onMensaje(JSON.parse(msg.body))
        );
      },
      onStompError: (frame) => console.error('STOMP chat error:', frame),
    });

    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [idPartida, equipo]);

  const enviarMensaje = useCallback((texto) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/partidas/${idPartida}/chat`,
      body: JSON.stringify({ idPartida, mensaje: texto }),
    });
  }, [idPartida]);

  return { enviarMensaje };
}