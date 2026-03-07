/*
 * Fichero que contiene el contexto del usuario loggeado y su información
 * básica.
 */

import { createContext, useState, useEffect } from "react";

// Creamos el contexto
export const UserContext = createContext();

// Creamos el UserProvider al que accede App.jsx para envolver toda la aplicación.
export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // Aquí guardamos: { alias, balas, rango... }
  const [isLoading, setIsLoading] = useState(true); // Para la pantalla de carga inicial

  // Se ejecuta al refrescar la página (F5) o abrir la app
  useEffect(() => {
    checkSession();
  }, []);

  // Función para preguntar al backend: "¿Tengo una cookie de sesión válida?"
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

  // Función para actualizar balas globalmente (ej: al comprar en la Tienda o 
  // al ganar una partida)
  const updateBullets = (amount) => {
    if (user) {
      setUser({ ...user, balas: user.balas + amount });
    }
  };

  // Función para cerrar sesión (Limpiamos el estado en React)
  const logout = async () => {
    // TODO: añadir la URI del backend.
    // Le avisamos al backend para que destruya la cookie
    await fetch("http://AÑADIR_URI/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, isLoading, updateBullets, logout, checkSession }}>
      {children}
    </UserContext.Provider>
  );
}