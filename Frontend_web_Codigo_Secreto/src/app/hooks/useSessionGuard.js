import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useToast } from "../context/ToastContext";

const WS_URL = import.meta.env.VITE_WS_URL;

export function useSessionGuard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const stompRef = useRef(null);
  const subscribedRef = useRef(false);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token");
    if (!token) return;

    if (stompRef.current?.connected || subscribedRef.current) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/user/queue/session-invalidated", (message) => {
          // Limpiar sesión
          sessionStorage.removeItem("jwt_token");
          sessionStorage.removeItem("user");

          // Mostrar notificación
          showToast("Su sesión ha sido cerrada porque se inició en otro dispositivo.", "warning");

          // Redirigir al lobby (home)
          navigate("/home", { replace: true });
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
  }, [navigate, showToast]);
}