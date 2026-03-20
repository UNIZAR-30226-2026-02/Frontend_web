/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * usando WebSockets, relativas a la pantalla de lista de partidas públicas.
 */

import { useEffect, useRef } from 'react';
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
        
        // Nos suscribimos al canal (esto disparará el @SubscribeMapping en Spring Boot
        // para recibir los datos del estado inicial).
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

