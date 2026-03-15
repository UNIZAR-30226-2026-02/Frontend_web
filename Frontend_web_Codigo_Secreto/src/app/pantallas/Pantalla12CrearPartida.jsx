import { ScreenFrame, ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader, SubsectionLabel } from "../components/ScreenFrame";
import { Globe, Lock, Clock, Palette, Check, Copy, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function Pantalla12CrearPartida() {
  const [matchType, setMatchType] = useState("public");
  const [timer, setTimer] = useState(60);
  const [theme, setTheme] = useState("Cyberpunk");
  const navigate = useNavigate();

  return (
    <ScreenFrame title="SALA DE RECLUTAMIENTO">
      <div className="max-w-3xl mx-auto pt-8 sm:pt-4">
        <button
          onClick={() => navigate("/home")}
          className="back-btn group"
        >
          <ArrowLeft className="back-btn-icon" />
          <span className="back-btn-text">VOLVER AL ESCRITORIO</span>
        </button>

        <ManilaFolder>
          <div className="folder-content">
            {/* Tab */}
            <div className="folder-tab">
              <span className="folder-tab-text">RECLUTAMIENTO</span>
            </div>

            <div className="flex items-start justify-between mb-5 flex-wrap gap-3 mt-2">
              <div>
                <SectionHeader title="SALA DE RECLUTAMIENTO" />
                <p className="settings-subtitle">Configure los parámetros de la operación</p>
              </div>
              <FBISeal size={50} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tipo partida */}
              <div>
                <SubsectionLabel label="TIPO DE OPERACIÓN" borderColor="#2a3a5a" />
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { key: "public", icon: Globe, label: "PÚBLICA", sub: "Cualquier agente" },
                    { key: "private", icon: Lock, label: "PRIVADA", sub: "Solo invitados" },
                  ].map((opt) => (
                    <DarkCard
                      key={opt.key}
                      className={`p-4 sm:p-5 cursor-pointer text-center transition-all ${
                        matchType === opt.key ? "selected-card" : ""
                      }`}
                      onClick={() => setMatchType(opt.key)}
                    >
                      <opt.icon className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 ${
                        matchType === opt.key ? "icon-selected" : "icon-muted"
                      }`} />
                      <p className="card-title">{opt.label}</p>
                      <p className="card-subtitle">{opt.sub}</p>
                      {matchType === opt.key && (
                        <div className="selected-indicator">
                          <Check className="w-3 h-3" />
                          <span className="selected-text">SELECCIONADO</span>
                        </div>
                      )}
                    </DarkCard>
                  ))}
                </div>

                {matchType === "private" && (
                  <div className="code-box">
                    <div>
                      <span className="code-label">CÓDIGO SECRETO:</span>
                      <span className="code-value">XK7-DELTA</span>
                    </div>
                    <Copy className="code-copy-icon" />
                  </div>
                )}
              </div>

              {/* Temporizador y tema */}
              <div className="space-y-5">
                <div>
                  <SubsectionLabel label="TIEMPO POR TURNO" borderColor="#5a4a20" />
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 60, 90, 120].map((t) => (
                      <DarkCard
                        key={t}
                        className={`timer-card ${timer === t ? "selected-timer" : ""}`}
                        onClick={() => setTimer(t)}
                      >
                        <Clock className={`timer-icon ${timer === t ? "selected" : ""}`} />
                        <p className="timer-value">{t}s</p>
                      </DarkCard>
                    ))}
                  </div>
                </div>

                <div>
                  <SubsectionLabel label="TEMA DE CARTAS" borderColor="#8b2020" />
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Cyberpunk", emoji: "🌃" },
                      { name: "Naturaleza", emoji: "🌿" },
                      { name: "Espacio", emoji: "🚀" },
                    ].map((t) => (
                      <DarkCard
                        key={t.name}
                        className={`theme-card ${theme === t.name ? "selected-theme" : ""}`}
                        onClick={() => setTheme(t.name)}
                      >
                        <span className="theme-emoji">{t.emoji}</span>
                        <p className="theme-name">{t.name}</p>
                      </DarkCard>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/lobby")}
              className="create-mission-btn"
            >
              <span className="create-mission-text">CREAR MISIÓN</span>
            </button>

            <div className="footer-stamp">
              <RedStamp text="TOP SECRET" className="rotate-[-3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}