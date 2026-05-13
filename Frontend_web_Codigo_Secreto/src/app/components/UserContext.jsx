/*
 * Fichero que contiene el contexto del usuario loggeado y su información
 * básica.
 */

import { createContext, useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { logoutUsuario, desactivarCuentaUsuario } from "../api/apiLogin";
import { useToast } from "../context/ToastContext";
import { useSound } from "../hooks/useSound"; // Importamos el hook de sonido

// URL base para API REST
const API_BASE_URL = import.meta.env.VITE_API_URL;
// URL base para WebSockets
const WS_BASE_URL = import.meta.env.VITE_WS_URL;

// Creamos el contexto
export const UserContext = createContext();

// Creamos el UserProvider al que accede App.jsx para envolver toda la aplicación.
export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // Aquí guardamos: {id_google, tag, fotoPerfil, balas, partidas_jugadas, victorias, numAciertos, numFallos}
  const [isLoading, setIsLoading] = useState(true); // Para la pantalla de carga inicial
  const { showToast } = useToast();

  // Obtenemos la función resetVolumes del contexto de sonido
  const { resetVolumes } = useSound();

  // Referencia para mantener la conexión WebSocket activa
  const stompClientRef = useRef(null);

  // Se ejecuta al refrescar la página (F5) o abrir la app
  useEffect(() => {
    checkSession();
  }, []);

  // Efecto para gestionar la conexión WebSocket a la cola privada del jugador.
  useEffect(() => {
    // Si no hay usuario logueado, limpiamos la conexión si existe
    if (!user) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      // Se añade el token a los headers
      connectHeaders: {
        Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
      },
      reconnectDelay: 3000,
      onConnect: () => {
        console.log("Conectado al WebSocket de UserContext");

        // Nos suscribimos a la cola privada del usuario, para ser notificados de cambios en 
        // su perfil.
        // TODO: comprobar que funciona con el endpoint utilizado en backend.
        client.subscribe("/user/queue/jugadores", (message) => {
          if (message.body) {
            // Actualización del objeto 'user'.
            const datosActualizados = JSON.parse(message.body);
            setUser(datosActualizados);
          }
        });
      },
      onDisconnect: () => {
        console.log("Desconectado del WebSocket de UserContext");
      },
      onStompError: (frame) => {
        if (frame.headers?.message === "SESSION_INVALIDATED") {
          handleDesconexion();
          window.location.href = "/login";
          return;
        }
        console.error("STOMP error en UserContext:", frame);
        showToast("Error de conexión con el servidor", "error");
      },
      onWebSocketError: (event) => {
        console.error("WS error en UserContext:", event);
        showToast("Se ha perdido la conexión en tiempo real", "warning");
      }
    });

    client.activate();
    stompClientRef.current = client;

    // Desconectar al desmontar o cambiar de usuario
    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
    
  }, [user?.id_google]); // Se ejecuta este useEffect cuando cambia el id_google del usuario logueado.

  // Función para preguntar al backend: "¿Tengo una cookie de sesión válida?" y recuperar
  // todos los datos del jugador logueado, si lo hay.
  const checkSession = async () => {
    try {
      // Se utiliza 'credentials: include' para pedirle al navegador la cookie 
      // HttpOnly con el ID de usuario. Se envía al backend para que verifique si
      // es válida y devuelva el perfil del agente.
      
      // Petición GET para obtener la información del usuario logueado (o no).
      const response = await fetch(`${API_BASE_URL}/jugadores`, {
        method: 'GET',
        credentials: "include" 
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data); // Guardamos el perfil del agente (incluyendo sus balas)
      } else {
        handleDesconexion(); // No hay sesión o caducó, limpiamos todo (React y sessionStorage)
      }
    } catch (error) {
      console.error("Error validando sesión:", error);
      handleDesconexion(); // Si el servidor cae, también limpiamos para evitar inconsistencias
    } finally {
      setIsLoading(false); // Terminamos de cargar, ya podemos mostrar la UI
    }
  };

  // Función que agrupa la lógica para limpiar completamente el rastro del usuario
  // cuando cierra sesión o cuando se ejecuta checkSession sin que haya una cookie válida,
  // para evitar usar tokens caducados.
  const handleDesconexion = () => {
    setUser(null);
    sessionStorage.removeItem('jwt_token'); 
  };

  // Función que se llama desde Pantalla01Login tras loguear al usuario con éxito, 
  // guardando toda su información.
  const loginUsuario = (datosJugador) => {
    setUser(datosJugador);
    // Restablecemos los volúmenes de sonido a sus valores por defecto (0.5 y 0.7)
    // en cada nuevo inicio de sesión.
    if (resetVolumes) {
      resetVolumes();
    }
  };

  // Función para cerrar sesión (Limpiamos el estado en React)
  const logout = async () => {
    try {
      await logoutUsuario();
    } catch (error) {
      console.error("Error al notificar la desconexión al servidor", error);
    } finally {
      handleDesconexion(); 
    }
  };

  // Función para desactivar la cuenta del usuario. Llama a la API y, si tiene éxito, cierra sesión y el backend resetea los datos.
  const desactivarCuenta = async () => {
    try {
      await desactivarCuentaUsuario();
      handleDesconexion();
      return true;
    } catch (error) {
      console.error("Error al desactivar cuenta:", error);
      return false;
    }
  };

  return (
    // Funciones y datos que se exponen al exterior.
    <UserContext.Provider value={{ user, isLoading, loginUsuario, /*updateBullets,*/ logout, setUser, checkSession, desactivarCuenta }}>
      {children}
    </UserContext.Provider>
  );
}