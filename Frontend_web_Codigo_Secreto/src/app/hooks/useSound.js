import { useContext } from 'react';
import { SoundContext } from '../context/SoundContext';

/**
 * Custom Hook: useSound
 * Proporciona una interfaz sencilla para acceder al sistema de sonido.
 * Encapsula la lógica de validación para evitar errores comunes de Context en React.
 */
export function useSound() {
  // Consumimos el contexto global definido en SoundProvider
  const context = useContext(SoundContext);

  /**
   * CONTROL DE ERRORES :
   * Si 'context' es undefined, significa que alguien ha intentao usar useSound()
   * en un componente que no está envuelto por el <SoundProvider>.
   * Lanzams error explícito
   */
  if (!context) {
    throw new Error('useSound debe usarse dentro de un SoundProvider');
  }

  // Devolvemos todas las funciones y estados (playClick, setMusicVolume, etc.)
  return context;
}