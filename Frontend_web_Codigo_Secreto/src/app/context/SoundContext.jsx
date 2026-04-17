import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';

/**
 * Contexto para exponer el estado y funciones de sonido a toda la app.
 */
export const SoundContext = createContext();

// Importación de assets (asume que están configurados en el bundler como Vite o Webpack)
import bgMusicUrl from '../../assets/loop_musica.mp3';
import clickSoundUrl from '../../assets/sonido_click.mp3';
import typeSoundUrl from '../../assets/sonido_teclear.mp3';
import disparoSoundUrl from '../../assets/sonido_disparo.mp3';
import aplausoSoundUrl from '../../assets/sonido_aplauso.mp3';
import fiascoSoundUrl from '../../assets/sonido_fiasco.mp3';
import whooshSoundUrl from '../../assets/sonido_whoosh.mp3';
import aceptarSoundUrl from '../../assets/sonido_aceptar.mp3';
import cancelarSoundUrl from '../../assets/sonido_cancelar.mp3';

// Claves constantes para evitar errores de dedo en localStorage
const STORAGE_MUSIC_VOLUME = 'sound_music_volume';
const STORAGE_SFX_VOLUME = 'sound_sfx_volume';

export function SoundProvider({ children }) {
  /**
   * ESTADO Y PERSISTENCIA
   * Inicializamos los volúmenes leyendo de localStorage. 
   * Si no existen, usamos valores por defecto (0.5 y 0.7). SE PUEDEN CAMBIAR
   */
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = localStorage.getItem(STORAGE_MUSIC_VOLUME);
    return saved !== null ? parseFloat(saved) : 0.5;
  });
  const [sfxVolume, setSfxVolume] = useState(() => {
    const saved = localStorage.getItem(STORAGE_SFX_VOLUME);
    return saved !== null ? parseFloat(saved) : 0.7;
  });

  /**
   * REFERENCIAS (Audio Elements)
   * Usamos useRef para mantener los objetos Audio vivos durante todo el ciclo de 
   * vida de la app sin provocar re-renders.
   */
  const bgAudioRef = useRef(null);
  const clickAudioRef = useRef(null);
  const typeAudioRef = useRef(null);
  const disparoAudioRef = useRef(null);
  const aplausoAudioRef = useRef(null);
  const fiascoAudioRef = useRef(null);
  const whooshAudioRef = useRef(null);
  const aceptarAudioRef = useRef(null);
  const cancelarAudioRef = useRef(null);

  /**
   * CICLO DE VIDA: Inicialización
   * Se ejecuta una sola vez al montar el componente.
   */
  useEffect(() => {
    // Configuración de Música de Fondo
    const bgAudio = new Audio();
    bgAudio.loop = true;
    bgAudio.volume = musicVolume;
    bgAudio.src = bgMusicUrl;
    bgAudio.load();
    bgAudioRef.current = bgAudio;

    // Configuración de SFX (Click)
    const clickAudio = new Audio();
    clickAudio.volume = sfxVolume;
    clickAudio.src = clickSoundUrl;
    clickAudio.load();
    clickAudioRef.current = clickAudio;

    // Configuración de SFX (Tecleo)
    const typeAudio = new Audio();
    typeAudio.volume = sfxVolume;
    typeAudio.src = typeSoundUrl;
    typeAudio.load();
    typeAudioRef.current = typeAudio;

    const disparoAudio = new Audio();
    disparoAudio.volume = sfxVolume;
    disparoAudio.src = disparoSoundUrl;
    disparoAudio.load();
    disparoAudioRef.current = disparoAudio;

    const aplausoAudio = new Audio();
    aplausoAudio.volume = sfxVolume;
    aplausoAudio.src = aplausoSoundUrl;
    aplausoAudio.load();
    aplausoAudioRef.current = aplausoAudio;

    const fiascoAudio = new Audio();
    fiascoAudio.volume = sfxVolume;
    fiascoAudio.src = fiascoSoundUrl;
    fiascoAudio.load();
    fiascoAudioRef.current = fiascoAudio;

    const whooshAudio = new Audio();
    whooshAudio.volume = sfxVolume;
    whooshAudio.src = whooshSoundUrl;
    whooshAudio.load();
    whooshAudioRef.current = whooshAudio;

    const aceptarAudio = new Audio();
    aceptarAudio.volume = sfxVolume;
    aceptarAudio.src = aceptarSoundUrl;
    aceptarAudio.load();
    aceptarAudioRef.current = aceptarAudio;

    const cancelarAudio = new Audio();
    cancelarAudio.volume = sfxVolume;
    cancelarAudio.src = cancelarSoundUrl;
    cancelarAudio.load();
    cancelarAudioRef.current = cancelarAudio;

    // Cleanup: detiene todos los audios si el componente se desmonta
    return () => {
      [bgAudio, clickAudio, typeAudio, disparoAudio, aplausoAudio, fiascoAudio, whooshAudio, aceptarAudio, cancelarAudio].forEach(a => {
        a.pause();
        a.src = '';
      });
    };
  }, []);

  /**
   * SINCRONIZACIÓN DE VOLUMEN
   * Estos efectos aseguran que cuando el estado cambia, el volumen del 
   * elemento de audio real y el localStorage se actualicen.
   */
  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume;
    localStorage.setItem(STORAGE_MUSIC_VOLUME, musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    if (clickAudioRef.current) clickAudioRef.current.volume = sfxVolume;
    if (typeAudioRef.current) typeAudioRef.current.volume = sfxVolume;
    if (disparoAudioRef.current) disparoAudioRef.current.volume = sfxVolume;
    if (aplausoAudioRef.current) aplausoAudioRef.current.volume = sfxVolume;
    if (fiascoAudioRef.current) fiascoAudioRef.current.volume = sfxVolume;
    if (whooshAudioRef.current) whooshAudioRef.current.volume = sfxVolume;
    if (aceptarAudioRef.current) aceptarAudioRef.current.volume = sfxVolume;
    if (cancelarAudioRef.current) cancelarAudioRef.current.volume = sfxVolume;
    localStorage.setItem(STORAGE_SFX_VOLUME, sfxVolume);
  }, [sfxVolume]);

  /**
   * LÓGICA DE REPRODUCCIÓN CON FALLBACK
   * Intenta reproducir el archivo. Si falla (ej. error 404), ejecuta la función de respaldo.
   */
  const playSound = useCallback((audioRef, fallbackFn) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.currentTime = 0; // Reinicia el sonido para permitir clics rápidos
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Audio file failed, using synth fallback.");
        if (fallbackFn) fallbackFn();
      });
    }
  }, []);

  /**
   * FALLBACKS SINTÉTICOS (Web Audio API)
   * Si no hay archivos .mp3, genera un "bip" usando osciladores matemáticos (estoy craisi)
   */
  const playClickFallback = useCallback(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    
    oscillator.frequency.value = 800;
    gain.gain.value = sfxVolume * 0.3;
    oscillator.type = 'sine';
    
    oscillator.start();
    // fade out para que suene como un clic
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
    oscillator.stop(audioCtx.currentTime + 0.1);
    
    setTimeout(() => audioCtx.close(), 200); // Limpieza de contexto
  }, [sfxVolume]);

  const playTypeFallback = useCallback(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    
    oscillator.frequency.value = 1200;
    gain.gain.value = sfxVolume * 0.15;
    oscillator.type = 'triangle'; // Sonido más metálico para teclas
    
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.05);
    oscillator.stop(audioCtx.currentTime + 0.05);
    
    setTimeout(() => audioCtx.close(), 100);
  }, [sfxVolume]);

  // Interfaces públicas para los sonidos
  const playClick = useCallback(() => playSound(clickAudioRef, playClickFallback), [playSound, playClickFallback]);
  const playType = useCallback(() => playSound(typeAudioRef, playTypeFallback), [playSound, playTypeFallback]);
  const playDisparo = useCallback(() => playSound(disparoAudioRef), [playSound]);
  const playAplauso = useCallback(() => playSound(aplausoAudioRef), [playSound]);
  const playFiasco = useCallback(() => playSound(fiascoAudioRef), [playSound]);
  const playWhoosh = useCallback(() => playSound(whooshAudioRef), [playSound]);
  const playAceptar = useCallback(() => playSound(aceptarAudioRef), [playSound]);
  const playCancelar = useCallback(() => playSound(cancelarAudioRef), [playSound]);

  const startBackgroundMusic = useCallback(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.play().catch(e => console.warn('Autoplay bloqueado todavía', e));
    }
  }, []);

  // Empaquetado del valor del contexto
  const contextValue = {
    musicVolume,
    sfxVolume,
    setMusicVolume,
    setSfxVolume,
    playClick,
    playType,
    playDisparo,
    playAplauso,
    playFiasco,
    playWhoosh,
    playAceptar,
    playCancelar,
    startBackgroundMusic,
  };

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
}