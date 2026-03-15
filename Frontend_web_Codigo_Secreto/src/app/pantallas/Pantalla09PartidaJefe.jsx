<<<<<<< HEAD
/*
 * Pantalla de juego, vista del Jefe de Espionaje. Es la pantalla que se muestra durante la partida, con el tablero y la información clasificada.
 */
import { ScreenFrame, ManilaFolder, DarkCard, RedStamp } from "../components/ScreenFrame";
import { boardWords, colorMap } from "../components/gameData";
import { Skull, Clock, Send, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

//TODO: integrar con backend para chat real , pistas reales...
const chatMessages = [
  { user: "LoboÁrtico", time: "11:42", text: "¿Qué opinan de esa pista?" },
  { user: "NightFox_99", time: "11:44", text: "Creo que ESTRELLA encaja" },
  { user: "LoboÁrtico", time: "11:45", text: "Yo voto por DRAGÓN" },
];

export function Pantalla09PartidaJefe() {
  const [clue, setClue] = useState("");
  const [number, setNumber] = useState(2);
  const [clueSent, setClueSent] = useState(false);
  const navigate = useNavigate();

  const handleSendClue = () => {
    if (clue.trim()) {
      setClueSent(true);
    }
  };

  return (
    <ScreenFrame title="VISTA DEL JEFE">
      {/* Barra superior */}
      <div className="agent-top-bar">
        <div className="top-bar-stats-group">
          <button onClick={() => navigate("/dashboard")} className="abort-mission-btn">
            <span>ABORTAR</span>
          </button>
          
          <DarkCard className="score-counter-card">
            <div className="score-team red-team">
              <div className="team-dot" />
              <span className="score-text">5</span>
            </div>
            <span className="score-separator">vs</span>
            <div className="score-team blue-team">
              <div className="team-dot" />
              <span className="score-text">4</span>
            </div>
          </DarkCard>

          <div className="current-turn-badge">
            <span>TURNO EQUIPO ROJO</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {clueSent && (
            <button 
              onClick={() => navigate("/mission-report")} 
              className="view-report-btn" 
              style={{ padding: "0.5rem 1rem" }}
            >
              <span style={{ fontSize: "11px", letterSpacing: "0.1em" }}>FIN PARTIDA</span>
            </button>
          )}
          <DarkCard className="score-counter-card" style={{ gap: "0.5rem" }}>
            <Clock className="timer-icon" />
            <span className="timer-clock-text" style={{ fontSize: "24px" }}>01:15</span>
          </DarkCard>
        </div>
      </div>

      {/* Rol */}
      <div className="role-badge-row">
        <div className="agent-role-badge">
          <span>JEFE DE ESPIONAJE — EQUIPO ROJO — VISTA CLASIFICADA</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="agent-main-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ManilaFolder>
            <div className="board-container">
              {/* Tablero : FALTAN IMÁGENES */}
              <div className="board-grid-5cols">
                {boardWords.map((row, ri) =>
                  row.map((word, ci) => {
                    const c = colorMap[ri][ci];
                    return (
                      <div key={`${ri}-${ci}`} className={`game-card card-revealed color-${c}`}>
                        <div className="card-inner-top">
                          {c === "A" && <Skull className="rev-icon-skull" />}
                          {c === "R" && <div className="rev-token token-red" />}
                          {c === "B" && <div className="rev-token token-blue" />}
                          {c === "C" && <div className="rev-token token-neutral" />}
                        </div>
                        <div className="card-inner-bottom">
                          <p className="card-word-text" style={{ textDecoration: "none" }}>{word}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Leyenda */}
              <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(138, 122, 96, 0.2)", flexWrap: "wrap" }}>
                {[
                  { label: "AGENTE ROJO", color: "#cc3333", bg: "rgba(204, 51, 51, 0.2)" },
                  { label: "AGENTE AZUL", color: "#3366cc", bg: "rgba(51, 102, 204, 0.2)" },
                  { label: "CIVIL", color: "#777777", bg: "rgba(119, 119, 119, 0.2)" },
                  { label: "ASESINO", color: "#000000", bg: "rgba(10, 10, 10, 0.8)" }
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "0.125rem", border: `2px solid ${s.color}`, backgroundColor: s.bg }} />
                    <span style={{ fontFamily: "var(--font-courier)", color: "#6a5a40", fontSize: "9px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ManilaFolder>

        </div>

        <div className="side-panels-column">

            {/* Chat */}
            <DarkCard className="chat-panel-container">
            <div className="chat-header-border">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="chat-title-elite">CANAL ENCRIPTADO</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", backgroundColor: "rgba(139, 32, 32, 0.2)", border: "1px solid rgba(139, 32, 32, 0.3)", borderRadius: "2px", padding: "0.125rem 0.5rem" }}>
                    <EyeOff style={{ width: "0.75rem", height: "0.75rem", color: "#e08080" }} />
                    <span style={{ fontFamily: "var(--font-courier)", color: "#e08080", fontSize: "8px" }}>SOLO LECTURA</span>
                </div>
                </div>
                <p className="chat-subtitle-courier">Chat de agentes — Equipo Rojo</p>
            </div>

            <div className="chat-messages-scroll-area">
                {chatMessages.map((m, i) => (
                <div key={i} className="message-row">
                    <div className="message-bubble bubble-default">
                    <div className="message-meta-info">
                        <span className="message-username">{m.user}</span>
                        <span className="message-timestamp">{m.time}</span>
                    </div>
                    <p className="message-content-text">{m.text}</p>
                    </div>
                </div>
                ))}
            </div>

            <div style={{ padding: "0.75rem", borderTop: "1px solid #3a3a3a", backgroundColor: "rgba(26, 26, 26, 0.5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}>
                <EyeOff style={{ width: "1rem", height: "1rem", color: "#666", flexShrink: 0 }} />
                <p style={{ fontFamily: "var(--font-courier)", color: "#555", fontStyle: "italic", fontSize: "10px" }}>
                    El Jefe de Espionaje no puede participar en el chat
                </p>
                </div>
            </div>
            </DarkCard>

            {/* Dar pista */}
          <DarkCard style={{ padding: "1.25rem" }}>
            <h3 style={{ fontFamily: "var(--font-special-elite)", color: "var(--theme-gold)", letterSpacing: "0.1em", fontSize: "14px", marginBottom: "0.75rem" }}>
              {clueSent ? "   PISTA ENVIADA" : "   DAR PISTA"}
            </h3>
            
            {clueSent ? (
              <div className="clue-display-box">
                <div>
                  <span className="clue-label">PISTA:</span>
                  <p className="clue-word-value highlight">{clue.toUpperCase()}</p>
                </div>
                <div className="clue-divider" />
                <div>
                  <span className="clue-label">CANTIDAD:</span>
                  <p className="clue-number-value">{number}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontFamily: "var(--font-courier)", color: "#888", display: "block", marginBottom: "0.25rem", fontSize: "10px" }}>PALABRA CLAVE:</label>
                  <input 
                    type="text" 
                    value={clue} 
                    onChange={(e) => setClue(e.target.value)} 
                    placeholder="Escribe tu pista..." 
                    style={{ 
                      width: "100%", backgroundColor: "#1a1a1a", border: "1px solid #444", borderRadius: "2px", 
                      padding: "0.625rem 0.75rem", fontFamily: "var(--font-courier)", color: "#e8dcc8", 
                      outline: "none", fontSize: "14px", boxSizing: "border-box" 
                    }} 
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-courier)", color: "#888", display: "block", marginBottom: "0.25rem", fontSize: "10px" }}>CANTIDAD:</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.375rem" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <button 
                        key={n} 
                        onClick={() => setNumber(n)} 
                        style={{ 
                          width: "2.5rem", height: "2.5rem", borderRadius: "9999px", border: "2px solid", 
                          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 150ms",
                          borderColor: number === n ? "#d4b878" : "#444", 
                          backgroundColor: number === n ? "rgba(212, 184, 120, 0.15)" : "transparent",
                          color: number === n ? "#d4b878" : "#666"
                        }}>
                        <span style={{ fontFamily: "var(--font-courier)", fontSize: "15px" }}>{n}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleSendClue} 
                  className="submit-vote-btn" 
                  disabled={!clue.trim()}
                  style={{ height: "2.5rem", padding: "0 1.5rem" }}
                >
                  <Send className="vote-btn-icon" style={{ width: "1rem", height: "1rem" }} />
                  <span>ENVIAR</span>
                </button>
              </div>
            )}
          </DarkCard>
        </div>
    </div>
      <div className="agent-footer-row">
        <RedStamp text="TOP SECRET" className="classified-stamp-effect" />
      </div>
    </ScreenFrame>
  );
=======
/*
 * Pantalla de juego, vista del Jefe de Espionaje. Es la pantalla que se muestra durante la partida, con el tablero y la información clasificada.
 */
import { ScreenFrame, ManilaFolder, DarkCard, RedStamp } from "../components/ScreenFrame";
import { boardWords, colorMap } from "../components/gameData";
import { Skull, Clock, Send, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

//TODO: integrar con backend para chat real , pistas reales...
const chatMessages = [
  { user: "LoboÁrtico", time: "11:42", text: "¿Qué opinan de esa pista?" },
  { user: "NightFox_99", time: "11:44", text: "Creo que ESTRELLA encaja" },
  { user: "LoboÁrtico", time: "11:45", text: "Yo voto por DRAGÓN" },
];

export function Pantalla09PartidaJefe() {
  const [clue, setClue] = useState("");
  const [number, setNumber] = useState(2);
  const [clueSent, setClueSent] = useState(false);
  const navigate = useNavigate();

  const handleSendClue = () => {
    if (clue.trim()) {
      setClueSent(true);
    }
  };

  return (
    <ScreenFrame title="VISTA DEL JEFE">
      {/* Barra superior */}
      <div className="agent-top-bar">
        <div className="top-bar-stats-group">
          <button onClick={() => navigate("/home")} className="abort-mission-btn">
            <span>ABORTAR</span>
          </button>
          
          <DarkCard className="score-counter-card">
            <div className="score-team red-team">
              <div className="team-dot" />
              <span className="score-text">5</span>
            </div>
            <span className="score-separator">vs</span>
            <div className="score-team blue-team">
              <div className="team-dot" />
              <span className="score-text">4</span>
            </div>
          </DarkCard>

          <div className="current-turn-badge">
            <span>TURNO EQUIPO ROJO</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {clueSent && (
            <button 
              onClick={() => navigate("/mission-report")} 
              className="view-report-btn" 
              style={{ padding: "0.5rem 1rem" }}
            >
              <span style={{ fontSize: "11px", letterSpacing: "0.1em" }}>FIN PARTIDA</span>
            </button>
          )}
          <DarkCard className="score-counter-card" style={{ gap: "0.5rem" }}>
            <Clock className="timer-icon" />
            <span className="timer-clock-text" style={{ fontSize: "24px" }}>01:15</span>
          </DarkCard>
        </div>
      </div>

      {/* Rol */}
      <div className="role-badge-row">
        <div className="agent-role-badge">
          <span>JEFE DE ESPIONAJE — EQUIPO ROJO — VISTA CLASIFICADA</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="agent-main-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ManilaFolder>
            <div className="board-container">
              {/* Tablero : FALTAN IMÁGENES */}
              <div className="board-grid-5cols">
                {boardWords.map((row, ri) =>
                  row.map((word, ci) => {
                    const c = colorMap[ri][ci];
                    return (
                      <div key={`${ri}-${ci}`} className={`game-card card-revealed color-${c}`}>
                        <div className="card-inner-top">
                          {c === "A" && <Skull className="rev-icon-skull" />}
                          {c === "R" && <div className="rev-token token-red" />}
                          {c === "B" && <div className="rev-token token-blue" />}
                          {c === "C" && <div className="rev-token token-neutral" />}
                        </div>
                        <div className="card-inner-bottom">
                          <p className="card-word-text" style={{ textDecoration: "none" }}>{word}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Leyenda */}
              <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(138, 122, 96, 0.2)", flexWrap: "wrap" }}>
                {[
                  { label: "AGENTE ROJO", color: "#cc3333", bg: "rgba(204, 51, 51, 0.2)" },
                  { label: "AGENTE AZUL", color: "#3366cc", bg: "rgba(51, 102, 204, 0.2)" },
                  { label: "CIVIL", color: "#777777", bg: "rgba(119, 119, 119, 0.2)" },
                  { label: "ASESINO", color: "#000000", bg: "rgba(10, 10, 10, 0.8)" }
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "0.125rem", border: `2px solid ${s.color}`, backgroundColor: s.bg }} />
                    <span style={{ fontFamily: "var(--font-courier)", color: "#6a5a40", fontSize: "9px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ManilaFolder>

        </div>

        <div className="side-panels-column">

            {/* Chat */}
            <DarkCard className="chat-panel-container">
            <div className="chat-header-border">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="chat-title-elite">CANAL ENCRIPTADO</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", backgroundColor: "rgba(139, 32, 32, 0.2)", border: "1px solid rgba(139, 32, 32, 0.3)", borderRadius: "2px", padding: "0.125rem 0.5rem" }}>
                    <EyeOff style={{ width: "0.75rem", height: "0.75rem", color: "#e08080" }} />
                    <span style={{ fontFamily: "var(--font-courier)", color: "#e08080", fontSize: "8px" }}>SOLO LECTURA</span>
                </div>
                </div>
                <p className="chat-subtitle-courier">Chat de agentes — Equipo Rojo</p>
            </div>

            <div className="chat-messages-scroll-area">
                {chatMessages.map((m, i) => (
                <div key={i} className="message-row">
                    <div className="message-bubble bubble-default">
                    <div className="message-meta-info">
                        <span className="message-username">{m.user}</span>
                        <span className="message-timestamp">{m.time}</span>
                    </div>
                    <p className="message-content-text">{m.text}</p>
                    </div>
                </div>
                ))}
            </div>

            <div style={{ padding: "0.75rem", borderTop: "1px solid #3a3a3a", backgroundColor: "rgba(26, 26, 26, 0.5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}>
                <EyeOff style={{ width: "1rem", height: "1rem", color: "#666", flexShrink: 0 }} />
                <p style={{ fontFamily: "var(--font-courier)", color: "#555", fontStyle: "italic", fontSize: "10px" }}>
                    El Jefe de Espionaje no puede participar en el chat
                </p>
                </div>
            </div>
            </DarkCard>

            {/* Dar pista */}
          <DarkCard style={{ padding: "1.25rem" }}>
            <h3 style={{ fontFamily: "var(--font-special-elite)", color: "var(--theme-gold)", letterSpacing: "0.1em", fontSize: "14px", marginBottom: "0.75rem" }}>
              {clueSent ? "   PISTA ENVIADA" : "   DAR PISTA"}
            </h3>
            
            {clueSent ? (
              <div className="clue-display-box">
                <div>
                  <span className="clue-label">PISTA:</span>
                  <p className="clue-word-value highlight">{clue.toUpperCase()}</p>
                </div>
                <div className="clue-divider" />
                <div>
                  <span className="clue-label">CANTIDAD:</span>
                  <p className="clue-number-value">{number}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontFamily: "var(--font-courier)", color: "#888", display: "block", marginBottom: "0.25rem", fontSize: "10px" }}>PALABRA CLAVE:</label>
                  <input 
                    type="text" 
                    value={clue} 
                    onChange={(e) => setClue(e.target.value)} 
                    placeholder="Escribe tu pista..." 
                    style={{ 
                      width: "100%", backgroundColor: "#1a1a1a", border: "1px solid #444", borderRadius: "2px", 
                      padding: "0.625rem 0.75rem", fontFamily: "var(--font-courier)", color: "#e8dcc8", 
                      outline: "none", fontSize: "14px", boxSizing: "border-box" 
                    }} 
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-courier)", color: "#888", display: "block", marginBottom: "0.25rem", fontSize: "10px" }}>CANTIDAD:</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.375rem" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <button 
                        key={n} 
                        onClick={() => setNumber(n)} 
                        style={{ 
                          width: "2.5rem", height: "2.5rem", borderRadius: "9999px", border: "2px solid", 
                          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 150ms",
                          borderColor: number === n ? "#d4b878" : "#444", 
                          backgroundColor: number === n ? "rgba(212, 184, 120, 0.15)" : "transparent",
                          color: number === n ? "#d4b878" : "#666"
                        }}>
                        <span style={{ fontFamily: "var(--font-courier)", fontSize: "15px" }}>{n}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleSendClue} 
                  className="submit-vote-btn" 
                  disabled={!clue.trim()}
                  style={{ height: "2.5rem", padding: "0 1.5rem" }}
                >
                  <Send className="vote-btn-icon" style={{ width: "1rem", height: "1rem" }} />
                  <span>ENVIAR</span>
                </button>
              </div>
            )}
          </DarkCard>
        </div>
    </div>
      <div className="agent-footer-row">
        <RedStamp text="TOP SECRET" className="classified-stamp-effect" />
      </div>
    </ScreenFrame>
  );
>>>>>>> a5e07a161059ecb0debb059c89280fa459dec4d2
}