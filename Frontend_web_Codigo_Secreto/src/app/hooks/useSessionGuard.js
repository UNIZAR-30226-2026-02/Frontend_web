import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_WS_URL;

/**
 * Hook que escucha eventos de sesión invalidada desde el backend.
 * Si la misma cuenta inicia sesión en otro dispositivo, redirige al login
 * y muestra el mensaje correspondiente.
 */
export function useSessionGuard() {
  const navigate = useNavigate();
  const stompRef = useRef(null);
  const subscribedRef = useRef(false);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token");
    if (!token) return; // No conectar si no hay token

    if (stompRef.current?.connected || subscribedRef.current) {
      return; // Ya conectado
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        "X-Auth-Token": token,
      },
      debug: () => {}, // Silenciar logs
      reconnectDelay: 5000,
      onConnect: () => {
        // Suscribirse a eventos de sesión invalidada
        client.subscribe("/user/queue/session-invalidated", (message) => {
          // Limpiar sesión
          sessionStorage.removeItem("jwt_token");
          sessionStorage.removeItem("user");
          
          // Mostrar error y redirigir
          alert("Se ha iniciado sesión en otro dispositivo. Tu sesión actual ha sido cerrada por seguridad.");
          navigate("/login", { replace: true });
        });

        subscribedRef.current = true;
      },
      onStompError: (frame) => {
        console.warn("STOMP error:", frame);
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      if (stompRef.current?.connected) {
        stompRef.current.deactivate();
        stompRef.current = null;
        subscribedRef.current = false;
      }
    };
  }, [navigate]);
}
