import { useEffect, useRef } from 'react';
import { useSound } from '../hooks/useSound';

/**
 * Componente GlobalSoundEffects
 * Actúa como un listener invisible que añade efectos de sonido
 * a las interacciones del usuario en toda la aplicación.
 */
export function GlobalSoundEffects() {
  const { playClick, playType } = useSound();
  
  // Referencia para el "debouncing" o control de frecuencia del sonido de tecleo
  const lastTypeTimeRef = useRef(0);

  useEffect(() => {
    /**
     * Handler de clics globales.
     * Utiliza una técnica de "burbujeo" para encontrar si el elemento clickeado es interactivo.
     */
    const handleGlobalClick = (e) => {
      let target = e.target;
      let isInteractive = false;

      // Escalamos en el árbol para ver si el usuario ha hecho clic 
      // dentro de algo que debería sonar.
      while (target && target !== document.body) {
        if (
          target.tagName === 'BUTTON' || 
          target.getAttribute('role') === 'button' || 
          target.classList?.contains('cursor-pointer') ||
          target.onclick || 
          target.closest?.('button') 
        ) {
          isInteractive = true;
          break;
        }
        target = target.parentElement;
      }

      if (isInteractive) {
        playClick();
      }
    };

    /**
     * Handler de teclado global.
     * Identifica si el usuario está escribiendo para reproducir el sonido de tecleo.
     */
    const handleKeydown = (e) => {
      const target = e.target;
      const isTyping = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      if (isTyping) {
        // OPTIMIZACIÓN: Evitamos que el sonido se solape o sature si el usuario
        // escribe muy rápido o mantiene presionada una tecla
        const now = Date.now();
        if (now - lastTypeTimeRef.current > 80) {
          lastTypeTimeRef.current = now;
          playType();
        }
      }
    };

    // Registro de eventos en el objeto global document
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleKeydown);

    // Limpieza al desmontar el componente
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [playClick, playType]);

  // No renderiza nada again
  return null;
}