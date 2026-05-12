/*
 * Pantalla para el manual.
 * MODIFICADO: Los sliders de música y efectos ahora controlan el volumen real del sistema de sonido global.
 */

import { ScreenFrame, ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader, SubsectionLabel } from "../components/ScreenFrame";
import { Volume2, Music, Info, BookOpen, ArrowLeft } from "lucide-react";
// NUEVO: Importamos el hook useSound para acceder al contexto de sonido
import { useSound } from "../hooks/useSound";
import { useNavigate } from "react-router-dom";
import '../components/Manual.css'; 

export function Pantalla06Manual() {
  const navigate = useNavigate();

  // Obtenemos del contexto los valores de volumen (0..1) y las funciones para actualizarlos
  const { musicVolume, sfxVolume, setMusicVolume, setSfxVolume } = useSound();

  // Convertimos los valores internos (0..1) a porcentaje (0..100) para mostrarlos en la UI
  const musicPercent = Math.round(musicVolume * 100);
  const sfxPercent = Math.round(sfxVolume * 100);

  // Handles que convierten el porcentaje del slider (0..100) a fracción (0..1) y actualizan el contexto
  const handleMusicChange = (e) => {
    const percent = Number(e.target.value);
    setMusicVolume(percent / 100);
  };

  const handleSfxChange = (e) => {
    const percent = Number(e.target.value);
    setSfxVolume(percent / 100);
  };

  return (
    <ScreenFrame title="MANUAL OPERATIVO">
      <div className="settings-container">
        
        {/* Botón Volver */}
        <button onClick={() => navigate(-1)} className="back-btn group">
          <ArrowLeft className="back-btn-icon" />
          <span className="back-btn-text">VOLVER</span>
        </button>

        <ManilaFolder>
          <div className="folder-content">

            {/* Cabecera del Documento */}
            <div className="settings-header-area">
              <div>
                <SectionHeader title="MANUAL OPERATIVO" />
                <p className="settings-subtitle">Configuración del sistema y guía de operaciones</p>
              </div>
              <FBISeal size={50} />
            </div>

            {/* Cuadrícula Principal */}
            <div className="settings-grid">
              
              {/* COLUMNA IZQUIERDA: Reglas */}
              <div>
                <SubsectionLabel icon={<BookOpen className="w-4 h-4 text-[#5a4a30]" />} label="REGLAS DEL JUEGO" borderColor="#2a3a5a" />
                
                <DarkCard className="rules-card">
                  {/* Diagrama táctico */}
                  <div className="diagram-container">
                    <div className="diagram-grid">
                      {Array(20).fill(null).map((_, i) => {
                        let cellClass = "cell-neutral";
                        if (i % 7 === 0) cellClass = "cell-red";
                        else if (i % 5 === 0) cellClass = "cell-blue";
                        else if (i % 11 === 0) cellClass = "cell-black";

                        return <div key={i} className={`diagram-cell ${cellClass}`} />;
                      })}
                    </div>
                    <p className="diagram-caption">Tablero 4x5 — Diagrama táctico</p>
                  </div>

                  {/* Lista de reglas */}
                  <div className="rules-list">
                    {[
                      { num: "01", text: "Dos equipos compiten por descubrir sus agentes secretos en un tablero de 4x5 imágenes (20 cartas)." },
                      { num: "02", text: "El Jefe de Espionaje da pistas de una sola palabra y un número indicando cuántas cartas se relacionan para que los agentes intenten descubrir qué cartas pertenecen a su equipo." },
                      { num: "03", text: "Los Agentes debaten en el chat y votan cartas. Al alcanzar la mayoría simple, la carta se revela." },
                      { num: "04", text: "¡Cuidado con el ASESINO! Revelar esa carta significa derrota inmediata." },
                      { num: "05", text: "El Jefe de Espionaje puede VER el chat pero NO puede escribir mensajes." },
                      { num: "06", text: "Para ampliar una carta haz click en ella. Doble click para votar, ero solo si eres un agente." },
                    ].map((r) => (
                      <div key={r.num} className="rule-row">
                        <span className="rule-num">[{r.num}]</span>
                        <p className="rule-text">{r.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Leyenda */}
                  <div className="legend-container">
                    {[
                      { label: "Agente Rojo", boxClass: "legend-box-red" },
                      { label: "Agente Azul", boxClass: "legend-box-blue" },
                      { label: "Civil", boxClass: "legend-box-neutral" },
                      { label: "Asesino", boxClass: "legend-box-black" },
                    ].map((l) => (
                      <div key={l.label} className="legend-item">
                        <div className={`legend-box ${l.boxClass}`} />
                        <span className="legend-text">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </DarkCard>
              </div>

              {/* COLUMNA DERECHA: Audio y Acerca de */}
              <div className="audio-section">
                
                {/* Audio */}
                <div>
                  <SubsectionLabel icon={<Volume2 className="w-4 h-4 text-[#5a4a30]" />} label="AUDIO" borderColor="#5a4a20" />
                  <DarkCard className="audio-card">
                    
                    {/* Slider Música - AHORA CONTROL EL VOLUMEN REAL */}
                    <div className="slider-group">
                      <div className="slider-header">
                        <div className="slider-label-group">
                          <Music className="w-4 h-4 text-[#888]" />
                          <span className="slider-label">Música de Fondo</span>
                        </div>
                        {/* Mostramos el porcentaje actual */}
                        <span className="slider-value">{musicPercent}%</span>
                      </div>
                      <div className="slider-track">
                        {/* Barra de progreso visual */}
                        <div className="slider-fill music-fill" style={{ width: `${musicPercent}%` }} />
                        {/* Input range controla el volumen real */}
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={musicPercent} 
                          onChange={handleMusicChange} 
                          className="slider-input" 
                        />
                      </div>
                    </div>

                    {/* Slider SFX - AHORA CONTROL EL VOLUMEN REAL */}
                    <div className="slider-group">
                      <div className="slider-header">
                        <div className="slider-label-group">
                          <Volume2 className="w-4 h-4 text-[#888]" />
                          <span className="slider-label">Efectos de Sonido</span>
                        </div>
                        <span className="slider-value">{sfxPercent}%</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill sfx-fill" style={{ width: `${sfxPercent}%` }} />
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sfxPercent} 
                          onChange={handleSfxChange} 
                          className="slider-input" 
                        />
                      </div>
                    </div>

                  </DarkCard>
                </div>

                {/* About Box */}
                <div className="about-box">
                  <Info className="about-icon" />
                  <div>
                    <p className="about-title">CÓDIGO SECRETO v1.0.0</p>
                    <p className="about-copyright">Operación clasificada © 1976 — FBI Division</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie de página de la carpeta */}
            <div className="folder-footer">
              <span className="footer-doc-text">DOC: FBI-MANUAL-OPS-1976</span>
              <RedStamp text="CLASSIFIED" className="stamp-rotate" />
            </div>

          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}