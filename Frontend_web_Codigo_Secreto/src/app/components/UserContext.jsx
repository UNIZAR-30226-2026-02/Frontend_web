/*
 * Fichero que contiene el contexto del usuario loggeado y su información
 * básica.
 */

import { createContext, useState, useEffect } from "react";

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

  // TODO: añadirla a la API. 
  // Función para preguntar al backend: "¿Tengo una cookie de sesión válida?" y recuperar
  // todos los datos del jugador logueado, si lo hay.
  const checkSession = async () => {
    try {
      // TODO: añadir la URI del backend.
      // Se utiliza 'credentials: include' para pedirle al navegador la cookie 
      // HttpOnly con el ID de usuario. Se envía al backend para que verifique si
      // es válida y devuelva el perfil del agente.
      const response = await fetch("http://AÑADIR_URI", {
        credentials: "include" 
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data); // Guardamos el perfil del agente (incluyendo sus balas)
      } else {
        setUser(null); // No hay sesión o caducó
      }
    } catch (error) {
      console.error("Error validando sesión:", error);
      setUser(null);
    } finally {
      setIsLoading(false); // Terminamos de cargar, ya podemos mostrar la UI
    }
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
    await fetch("http://AÑADIR_URI/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    // Funciones y datos que se exponen al exterior.
    <UserContext.Provider value={{ user, isLoading, loginUsuario,updateBullets, logout, checkSession }}>
      {children}
    </UserContext.Provider>
  );
}