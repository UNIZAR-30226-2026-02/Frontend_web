import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/ws';

//PARA EL LOBBY

/*export function useLobbyWebSocket(idPartida, onLobbyUpdate, onPartidaIniciada) {
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
}*/


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