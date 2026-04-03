import { useEffect, useRef } from 'react';
import { useSound } from '../hooks/useSound';

/**
 * Componente BackgroundMusic
 * Su única función es detectar la primera interacción del usuario para
 * activar la música de fondo
 */
export function BackgroundMusic() {
  // Extraemos la función para iniciar la música de nuestro hook personalizado
  const { startBackgroundMusic } = useSound();

  // Usamos una referencia para asegurar que la música solo se intente activar una vez
  const startedRef = useRef(false);

  useEffect(() => {
    /**
     * Handler del evento de interacción.
     * Se ejecuta cuando el usuario hace clic o presiona una tecla, es para que entonces empiece la música.
     */
    const handleFirstInteraction = () => {
      // Verificamos si la música ya ha empezado mediante la referencia
      if (!startedRef.current) {
        startedRef.current = true;
        
        // Ejecutamos la lógica de reproducción
        startBackgroundMusic();

        // Limpieza inmediata: una vez que el usuario ha interactuado,, 
        // ya no necesitamos escuchar estos eventos en el documento.
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      }
    };

    // Suscribimos los eventos de interacción global al montar el componente
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    // Función de limpieza: se ejecuta al desmontar el componente.
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    
    // El efecto depende de la función startBackgroundMusic. 
  }, [startBackgroundMusic]);

  // No renderiza nada visual
  return null;
}