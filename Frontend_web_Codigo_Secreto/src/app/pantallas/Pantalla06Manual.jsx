import { ScreenFrame, ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader, SubsectionLabel } from "../components/ScreenFrame";
import { Volume2, Music, Info, BookOpen, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import '../components/Manual.css'; 

export function Pantalla06Manual() {
  const [musicVol, setMusicVol] = useState(70);
  const [sfxVol, setSfxVol] = useState(85);
  const navigate = useNavigate();

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
                      { num: "01", text: "Dos equipos compiten por descubrir sus agentes secretos en un tablero de 4x5 palabras (20 cartas)." },
                      { num: "02", text: "El Jefe de Espionaje da pistas de una sola palabra y un número indicando cuántas cartas se relacionan." },
                      { num: "03", text: "Los Agentes debaten en el chat y votan cartas. Al alcanzar la mayoría simple, la carta se revela." },
                      { num: "04", text: "¡Cuidado con el ASESINO! Revelar esa carta significa derrota inmediata." },
                      { num: "05", text: "El Jefe de Espionaje puede VER el chat pero NO puede escribir mensajes." },
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
                    
                    {/* Slider Música */}
                    <div className="slider-group">
                      <div className="slider-header">
                        <div className="slider-label-group">
                          <Music className="w-4 h-4 text-[#888]" />
                          <span className="slider-label">Música de Fondo</span>
                        </div>
                        <span className="slider-value">{musicVol}%</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill music-fill" style={{ width: `${musicVol}%` }} />
                        <input type="range" min="0" max="100" value={musicVol} onChange={(e) => setMusicVol(Number(e.target.value))} className="slider-input" />
                      </div>
                    </div>

                    {/* Slider SFX */}
                    <div className="slider-group">
                      <div className="slider-header">
                        <div className="slider-label-group">
                          <Volume2 className="w-4 h-4 text-[#888]" />
                          <span className="slider-label">Efectos de Sonido</span>
                        </div>
                        <span className="slider-value">{sfxVol}%</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill sfx-fill" style={{ width: `${sfxVol}%` }} />
                        <input type="range" min="0" max="100" value={sfxVol} onChange={(e) => setSfxVol(Number(e.target.value))} className="slider-input" />
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