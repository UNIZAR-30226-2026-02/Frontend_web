/*
 * Fichero en el que se implementa el contexto de notificaciones propias de un usuario,
 * que envolverá toda la aplicación para que pueda recibirlas en tiempo real desde cualquier
 * pantalla. Se usan las notificaciones nativas del navegador.
 */

import React, { createContext, useCallback, useEffect, useContext } from 'react';
import { useNotificacionesSociales } from '../hooks/hooksSocial';
import { UserContext } from '../components/UserContext';
import logo from '../../assets/logo.png';

export const NotificacionesContext = createContext();

export const NotificacionesProvider = ({ children }) => {

    // Obtenemos el estado del usuario del contexto
    const { user } = useContext(UserContext);

  const lanzarNotificacionNativa = (data) => {
    let titulo = "Secret Panda";
    
    // Extraemos el 'mensaje' que manda el backend en el payload
    let cuerpo = data.payload?.mensaje || "Mensaje entrante interceptado.";

    if (data.tipo === 'solicitud_amistad') {
      titulo = "Nueva Solicitud de Amistad";
      // El backend manda la frase en el campo 'mensaje' a través de enviarNotificacionGeneralWS
      cuerpo = data.payload.mensaje;
      
    } else if (data.tipo === 'logro_desbloqueado') {
      titulo = "¡Logro Desbloqueado!";
      if (data.payload.recompensa) {
        cuerpo = `${data.payload.mensaje} (+${data.payload.recompensa} balas)`;
      } else {
        cuerpo = data.payload.mensaje;
      }

    } else if (data.tipo === 'medalla_desbloqueada') {
      titulo = "¡Medalla Desbloqueada!";
      cuerpo = data.payload.mensaje;
    }

    const notificacion = new Notification(titulo, {
      body: cuerpo,
      // TODO: si no funciona, añadir logo.png a la carpeta actual y usar './logo.png'.
      icon: '/favicon.ico', 
      badge: '/favicon.ico',
      vibrate: [200, 100, 200]
    });

    notificacion.onclick = () => {
      window.focus(); // Trae la pestaña del juego al frente al hacer clic
      notificacion.close();
    };
  };

  const onNotificacionRecibida = useCallback((data) => {
    if ("Notification" in window && Notification.permission === "granted") {
      lanzarNotificacionNativa(data);
    }
  }, []);

  const onError = useCallback((errorMsg) => {
    console.error("Contexto de Notificaciones - Error:", errorMsg);
  }, []);

  // Extraemos el token actual (si lo hay) y se lo pasamos al hook
  const tokenActual = sessionStorage.getItem('jwt_token');

  // Mantenemos la conexión WebSocket viva en toda la app
  useNotificacionesSociales(onNotificacionRecibida, onError, tokenActual);

  return (
    <NotificacionesContext.Provider value={{}}>
      {children}
    </NotificacionesContext.Provider>
  );
};