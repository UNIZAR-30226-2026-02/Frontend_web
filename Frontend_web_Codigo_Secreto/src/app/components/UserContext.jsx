/*
 * Fichero que contiene el contexto del usuario loggeado y su información
 * básica.
 */

import { createContext, useState, useEffect } from "react";

// URL base del backend
const API_BASE_URL = "http://localhost:8080";

// Creamos el contexto
export const UserContext = createContext();

// Creamos el UserProvider al que accede App.jsx para envolver toda la aplicación.
export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // Aquí guardamos: {id_google, tag, fotoPerfil, balas, partidas_jugadas, victorias, numAciertos, numFallos}
  const [isLoading, setIsLoading] = useState(true); // Para la pantalla de carga inicial

  // Se ejecuta al refrescar la página (F5) o abrir la app
  useEffect(() => {
    checkSession();
  }, []);

  // Función para preguntar al backend: "¿Tengo una cookie de sesión válida?" y recuperar
  // todos los datos del jugador logueado, si lo hay.
  const checkSession = async () => {
    try {
      // TODO: añadir la URI del backend.
      // Se utiliza 'credentials: include' para pedirle al navegador la cookie 
      // HttpOnly con el ID de usuario. Se envía al backend para que verifique si
      // es válida y devuelva el perfil del agente.
      
      // Petición GET para obtener la información del usuario logueado (o no).
      const response = await fetch(`${API_BASE_URL}/api/jugadores`, {
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
  };

  // Función para actualizar balas globalmente (ej: al comprar en la Tienda o 
  // al ganar una partida)
  const updateBullets = (amount) => {
    if (user) {
      setUser({ ...user, balas: user.balas + amount });
    }
  };

  // TODO: conectarla con el backend.
  // Función para cerrar sesión (Limpiamos el estado en React)
  const logout = async () => {
    // Le avisamos al backend para que destruya la cookie
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { 
        method: "POST", 
        credentials: "include" 
      });
    } catch (error) {
      console.error("Error al notificar la desconexión al servidor", error);
    } finally {
      // Limpieza de 'user' y sessionStorage.
      handleDesconexion(); 
    }
  };

  return (
    // Funciones y datos que se exponen al exterior.
    <UserContext.Provider value={{ user, isLoading, loginUsuario, updateBullets, logout, checkSession }}>
      {children}
    </UserContext.Provider>
  );
}