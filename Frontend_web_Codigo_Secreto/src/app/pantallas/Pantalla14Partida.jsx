/*
 * Pantalla unificada de partida (RF-13, RF-14, RF-15, RF-16, RF-17, RF-18, RF-26)
 * Muestra la vista del Agente o del Jefe según el rol asignado automáticamente por el backend.
 */

import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import {
  Clock, Send as SendIcon, Check, Vote, Skull,
  AlertTriangle, EyeOff, ArrowLeft
} from "lucide-react";

import { ScreenFrame, ManilaFolder, DarkCard, RedStamp } from "../components/ScreenFrame";
import { UserContext } from "../components/UserContext";
import "../components/Partidas.css";

const WS_URL = "http://localhost:8080/ws";
const API_BASE = "http://localhost:8080/api";

//Formatear tiempo para temporizadores
function formatearTiempo(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

//Componente Carta
function GameCard({ carta, isSelected, isRevealed, canSelect, onSelect, isJefe }) {
  // colorMap solo visible para el jefe
  const colorClass = isRevealed
    ? `card-revealed color-${carta.tipo}`
    : isJefe && carta.tipo
    ? `card-jefe-preview color-${carta.tipo}`
    : "card-idle";

  const disabled = !canSelect && !isRevealed;

  return (
    <div
      className={`game-card ${colorClass} ${isSelected ? "card-selected" : ""} ${disabled && !isJefe ? "card-disabled" : ""}`}
      onClick={() => canSelect && onSelect(carta.id_carta_tablero)}
      style={{ cursor: canSelect ? "pointer" : "default" }}
    >
      {/* Imagen de la carta (RF-14) */}
      <div className="card-inner-top" style={{ position: "relative", overflow: "hidden" }}>
        {carta.imagen_url && !isRevealed ? (
          <img
            src={carta.imagen_url}
            alt={carta.palabra || "Carta"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isSelected ? 0.7 : 1,
            }}
          />
        ) : null}

        {/* Overlay revelado */}
        {isRevealed && carta.tipo === "asesino" && <Skull className="rev-icon-skull" />}
        {isRevealed && carta.tipo === "rojo" && <div className="rev-token token-red" />}
        {isRevealed && carta.tipo === "azul" && <div className="rev-token token-blue" />}
        {isRevealed && carta.tipo === "civil" && <div className="rev-token token-neutral" />}

        {/* Seleccionada: fingerprint */}
        {isSelected && !isRevealed && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "rgba(212,184,120,0.1)"
          }}>
            <Check style={{ width: "2rem", height: "2rem", color: "rgba(212,184,120,0.6)" }} />
          </div>
        )}

        {/* Vista del Jefe: borde de color de identidad */}
        {isJefe && !isRevealed && carta.tipo && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "4px",
            background: carta.tipo === "rojo" ? "#cc3333"
              : carta.tipo === "azul" ? "#3366cc"
              : carta.tipo === "asesino" ? "#000"
              : "#666"
          }} />
        )}
      </div>

      {/* Palabra de la carta */}
      <div className="card-inner-bottom">
        <p className="card-word-text">
          {carta.palabra || `Carta ${carta.id_carta_tablero}`}
        </p>
      </div>
    </div>
  );
}

//Chat
function ChatPanel({ mensajes, onEnviar, esJefe, chatInputRef }) {
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    onEnviar(chatInput.trim());
    setChatInput("");
  };

  return (
    <DarkCard className="chat-panel-container">
      <div className="chat-header-border">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="chat-title-elite">CANAL ENCRIPTADO</span>
          {esJefe && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              backgroundColor: "rgba(139,32,32,0.2)", border: "1px solid rgba(139,32,32,0.3)",
              borderRadius: "2px", padding: "0.125rem 0.5rem"
            }}>
              <EyeOff style={{ width: "0.75rem", height: "0.75rem", color: "#e08080" }} />
              <span style={{ fontFamily: "var(--font-courier)", color: "#e08080", fontSize: "8px" }}>SOLO LECTURA</span>
            </div>
          )}
        </div>
        <p className="chat-subtitle-courier">Chat de equipo en tiempo real</p>
      </div>

      <div className="chat-messages-scroll-area" ref={scrollRef}>
        {mensajes.map((m, i) => (
          <div key={i} className={`message-row ${m.es_propio ? "message-own" : ""}`}>
            <div className={`message-bubble ${m.es_propio ? "bubble-own" : m.es_system ? "bubble-system" : "bubble-default"}`}>
              <div className="message-meta-info">
                <span className="message-username">{m.tag || "Agente"}</span>
                <span className="message-timestamp">{m.hora}</span>
              </div>
              {!m.es_valido && !m.es_system ? (
                <p className="message-content-text" style={{ color: "#666", fontStyle: "italic" }}>
                  [Mensaje bloqueado por lenguaje inapropiado]
                </p>
              ) : (
                <p className="message-content-text">{m.mensaje}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {esJefe ? (
        <div style={{
          padding: "0.75rem", borderTop: "1px solid #3a3a3a",
          backgroundColor: "rgba(26,26,26,0.5)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}>
            <EyeOff style={{ width: "1rem", height: "1rem", color: "#666", flexShrink: 0 }} />
            <p style={{ fontFamily: "var(--font-courier)", color: "#555", fontStyle: "italic", fontSize: "10px" }}>
              El Jefe de Espionaje no puede participar en el chat
            </p>
          </div>
        </div>
      ) : (
        <div className="chat-input-bar">
          <input
            ref={chatInputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe mensaje..."
            className="chat-text-input"
          />
          <button onClick={handleSend} className="chat-send-btn">
            <SendIcon className="send-icon-sm" />
          </button>
        </div>
      )}
    </DarkCard>
  );
}

//Panel de Pista (Jefe)
function PanelPistaJefe({ onEnviarPista, pistaEnviada, pista }) {
  const [palabra, setPalabra] = useState("");
  const [numero, setNumero] = useState(2);

  const handleSend = () => {
    if (!palabra.trim()) return;
    onEnviarPista(palabra.trim().toUpperCase(), numero);
  };

  if (pistaEnviada && pista) {
    return (
      <DarkCard style={{ padding: "1.25rem" }}>
        <h3 style={{ fontFamily: "var(--font-special-elite)", color: "var(--theme-gold)", letterSpacing: "0.1em", fontSize: "14px", marginBottom: "0.75rem" }}>
          ✓ PISTA ENVIADA
        </h3>
        <div className="clue-display-box">
          <div>
            <span className="clue-label">PISTA:</span>
            <p className="clue-word-value highlight">{pista.palabra_pista}</p>
          </div>
          <div className="clue-divider" />
          <div>
            <span className="clue-label">CANTIDAD:</span>
            <p className="clue-number-value">{pista.pista_numero}</p>
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-courier)", color: "#888", fontSize: "10px", marginTop: "0.5rem" }}>
          Esperando votación de los agentes...
        </p>
      </DarkCard>
    );
  }

  return (
    <DarkCard style={{ padding: "1.25rem" }}>
      <h3 style={{ fontFamily: "var(--font-special-elite)", color: "var(--theme-gold)", letterSpacing: "0.1em", fontSize: "14px", marginBottom: "0.75rem" }}>
        DAR PISTA (RF-15)
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div>
          <label style={{ fontFamily: "var(--font-courier)", color: "#888", display: "block", marginBottom: "0.25rem", fontSize: "10px" }}>
            PALABRA CLAVE (una sola palabra):
          </label>
          <input
            type="text"
            value={palabra}
            onChange={(e) => {
              const val = e.target.value.replace(/\s/g, "");
              setPalabra(val.toUpperCase());
            }}
            placeholder="ej: NOCTURNO"
            style={{
              width: "100%", backgroundColor: "#1a1a1a", border: "1px solid #444",
              borderRadius: "2px", padding: "0.625rem 0.75rem",
              fontFamily: "var(--font-courier)", color: "#e8dcc8",
              outline: "none", fontSize: "14px", boxSizing: "border-box",
              letterSpacing: "0.15em"
            }}
          />
        </div>
        <div>
          <label style={{ fontFamily: "var(--font-courier)", color: "#888", display: "block", marginBottom: "0.25rem", fontSize: "10px" }}>
            NÚMERO DE CARTAS RELACIONADAS:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.375rem" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                onClick={() => setNumero(n)}
                style={{
                  width: "2.5rem", height: "2.5rem", borderRadius: "9999px",
                  border: "2px solid", cursor: "pointer", transition: "all 150ms",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderColor: numero === n ? "#d4b878" : "#444",
                  backgroundColor: numero === n ? "rgba(212,184,120,0.15)" : "transparent",
                  color: numero === n ? "#d4b878" : "#666"
                }}
              >
                <span style={{ fontFamily: "var(--font-courier)", fontSize: "15px" }}>{n}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={!palabra.trim()}
          className="submit-vote-btn"
          style={{ height: "2.5rem", padding: "0 1.5rem" }}
        >
          <SendIcon style={{ width: "1rem", height: "1rem" }} />
          <span>ENVIAR PISTA</span>
        </button>
      </div>
    </DarkCard>
  );
}

// Panel de Votación (Agente)
function PanelVotacionAgente({ pista, cartaSeleccionada, palabraSeleccionada, votosActuales, totalJugadores, onVotar, puedoVotar }) {
  if (!pista) {
    return (
      <DarkCard className="voting-action-panel">
        <p style={{ fontFamily: "var(--font-courier)", color: "#888", fontSize: "11px", textAlign: "center" }}>
          Esperando pista del Jefe de Espionaje...
        </p>
      </DarkCard>
    );
  }

  return (
    <DarkCard className="voting-action-panel">
      {/* Pista recibida */}
      <div className="clue-display-box" style={{ marginBottom: "0.75rem" }}>
        <div>
          <span className="clue-label">PISTA:</span>
          <p className="clue-word-value highlight">{pista.palabra_pista}</p>
        </div>
        <div className="clue-divider" />
        <div>
          <span className="clue-label">CARTAS:</span>
          <p className="clue-number-value">{pista.pista_numero}</p>
        </div>
      </div>

      {/* Votos en tiempo real */}
      <div style={{ marginBottom: "0.75rem" }}>
        <span className="voting-label-xs">
          VOTOS ACTUALES: {votosActuales?.length || 0}/{totalJugadores || "?"}
        </span>
        <div className="vote-dots-container">
          {(votosActuales || []).map((v, i) => (
            <div key={i} className="vote-dot dot-used" title={v.tag}>
              <Check className="vote-check-icon" />
            </div>
          ))}
        </div>
      </div>

      {/* Carta seleccionada */}
      {cartaSeleccionada && (
        <div className="current-selection-badge" style={{ marginBottom: "0.75rem" }}>
          <span className="voting-label-xs">SELECCIÓN:</span>
          <p className="selected-word-display">{palabraSeleccionada || `Carta #${cartaSeleccionada}`}</p>
        </div>
      )}

      {!puedoVotar && (
        <div className="no-votes-alert" style={{ marginBottom: "0.75rem" }}>
          <AlertTriangle className="alert-icon-sm" />
          <span className="alert-text-xs">NO ES TU TURNO</span>
        </div>
      )}

      <button
        onClick={() => onVotar(cartaSeleccionada)}
        disabled={!cartaSeleccionada || !puedoVotar}
        className="submit-vote-btn"
        style={{ width: "100%" }}
      >
        <Vote className="vote-btn-icon" />
        <span>VOTAR CARTA</span>
      </button>
    </DarkCard>
  );
}

// PANTALLA PRINCIPAL
export function PantallaPartida() {
  const navigate = useNavigate();
  const { idPartida } = useParams();
  const { user } = useContext(UserContext);

  const [rol, setRol] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [cartas, setCartas] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [rojoGana, setRojoGana] = useState(null);

  const [pistaActual, setPistaActual] = useState(null);
  const [pistaEnviada, setPistaEnviada] = useState(false);

  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [votosActuales, setVotosActuales] = useState([]);
  const [miVotoEnviado, setMiVotoEnviado] = useState(false);

  const [mensajes, setMensajes] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [finPartida, setFinPartida] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const stompRef = useRef(null);
  const chatInputRef = useRef(null);

  // 1. Obtener rol inicial
  useEffect(() => {
    const fetchRol = async () => {
      try {
        const res = await fetch(`${API_BASE}/partidas/${idPartida}/participantes/rol`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("No se ha podido obtener el rol");
        const data = await res.json();
        setRol(data.rol);
        setEquipo(data.equipo);
      } catch (err) {
        setError(err.message);
      }
    };
    if (idPartida) fetchRol();
  }, [idPartida]);

  const aplicarEstadoTablero = useCallback((data) => {
    if (data.tablero?.cartas) setCartas(data.tablero.cartas);
    if (data.turno_actual) setTurnoActual(data.turno_actual);
    if (data.rojo_gana !== undefined) setRojoGana(data.rojo_gana);
    if (data.pista_actual) setPistaActual(data.pista_actual);
    if (data.votos_actuales) setVotosActuales(data.votos_actuales);
  }, []);

  // 2. Obtener estado inicial
  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const res = await fetch(`${API_BASE}/partidas/${idPartida}/estado`, {
          credentials: "include"
        });
        if (!res.ok) return;
        const data = await res.json();
        aplicarEstadoTablero(data);
      } catch (err) {
        console.warn("Error cargando estado inicial", err);
      } finally {
        setCargando(false);
      }
    };
    if (idPartida && rol) fetchEstado();
  }, [idPartida, rol, aplicarEstadoTablero]);

  // 3. WebSockets
  useEffect(() => {
    if (!idPartida || !rol || !equipo) return;

    const token = sessionStorage.getItem("jwt_token");
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/partidas/${idPartida}/estado`, (msg) => {
          const data = JSON.parse(msg.body);
          aplicarEstadoTablero(data);
          setMiVotoEnviado(false);
          setCartaSeleccionada(null);
        });

        client.subscribe(`/topic/partidas/${idPartida}/temporizador`, (msg) => {
          const data = JSON.parse(msg.body);
          setTiempoRestante(data.segundos_restantes);
        });

        client.subscribe(`/topic/partidas/${idPartida}/pista`, (msg) => {
          const data = JSON.parse(msg.body);
          setPistaActual(data);
          setPistaEnviada(false);
          setMiVotoEnviado(false);
          setCartaSeleccionada(null);
          setVotosActuales([]);
        });

        client.subscribe(`/topic/partidas/${idPartida}/votos`, (msg) => {
          const data = JSON.parse(msg.body);
          setVotosActuales(data.votos_actuales || []);
        });

        client.subscribe(`/topic/partidas/${idPartida}/chat/${equipo.toLowerCase()}`, (msg) => {
          const data = JSON.parse(msg.body);
          const hora = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
          setMensajes((prev) => [...prev, {
            tag: data.tag || "Agente",
            mensaje: data.mensaje,
            hora,
            es_valido: data.es_valido !== false,
            es_propio: data.id_google === user?.id_google,
            es_system: false
          }]);
        });

        client.subscribe(`/topic/partidas/${idPartida}/fin`, (msg) => {
          const data = JSON.parse(msg.body);
          setFinPartida(data);
        });
      }
    });

    client.activate();
    stompRef.current = client;
    return () => client.deactivate();
  }, [idPartida, rol, equipo, aplicarEstadoTablero, user?.id_google]);

  // Acciones (CamelCase -> SnakeCase conversion automática por @JsonProperty o Naming Strategy)

  const handleEnviarPista = useCallback((palabra, numero) => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/app/partidas/${idPartida}/pista`,
      body: JSON.stringify({ palabra_pista: palabra, pista_numero: numero })
    });
    setPistaActual({ palabra_pista: palabra, pista_numero: numero });
    setPistaEnviada(true);
  }, [idPartida]);

  const handleVotar = useCallback((id_carta) => {
    if (!stompRef.current?.connected || !id_carta || miVotoEnviado) return;
    stompRef.current.publish({
      destination: `/app/partidas/${idPartida}/votar`,
      body: JSON.stringify({ 
        id_carta_tablero: id_carta,
        id_turno: pistaActual?.id_turno 
      })
    });
    setMiVotoEnviado(true);
  }, [idPartida, miVotoEnviado, pistaActual]);

  const handleEnviarMensaje = useCallback((texto) => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/app/partidas/${idPartida}/chat`,
      body: JSON.stringify({ mensaje: texto })
    });
  }, [idPartida]);

  const handleAbandonar = async () => {
    if (!window.confirm("¿Está seguro de que quiere abandonar la partida?")) return;
    try {
      await fetch(`${API_BASE}/partidas/${idPartida}/participantes`, {
        method: "DELETE",
        credentials: "include"
      });
      navigate("/home");
    } catch (err) { console.error(err); }
  };

  const esJefe = rol === "jefe";
  const esMiTurno = turnoActual === equipo;
  const puedoVotar = !esJefe && esMiTurno && !miVotoEnviado && pistaActual;

  const cartaSeleccionadaObj = cartas.find(c => c.id_carta_tablero === cartaSeleccionada);
  const palabraSeleccionada = cartaSeleccionadaObj?.palabra;

  const rojoDescubiertos = cartas.filter(c => c.tipo === "rojo" && c.estado === "revelada").length;
  const azulDescubiertos = cartas.filter(c => c.tipo === "azul" && c.estado === "revelada").length;
  const totalRojo = cartas.filter(c => c.tipo === "rojo").length;
  const totalAzul = cartas.filter(c => c.tipo === "azul").length;

  if (cargando && !cartas.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <p style={{ fontFamily: "var(--font-courier)", color: "#c4a060", fontSize: "14px" }}>
          ESTABLECIENDO CONEXIÓN SEGURA...
        </p>
      </div>
    );
  }

  return (
    <ScreenFrame title={esJefe ? "VISTA DEL JEFE DE ESPIONAJE" : "VISTA DEL AGENTE"}>
      {finPartida && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <div className={`end-game-stamp ${finPartida.ganador === equipo ? "win-stamp" : "lose-stamp"}`}>
              {finPartida.ganador === equipo ? <Check className="end-game-icon" /> : <Skull className="end-game-icon" />}
              <p className="end-game-title">{finPartida.ganador === equipo ? "MISIÓN COMPLETADA" : "MISIÓN FALLIDA"}</p>
            </div>
            <button onClick={() => navigate("/home")} className="view-report-btn">VOLVER AL HOME</button>
          </div>
        </div>
      )}

      <div className="agent-top-bar">
        <div className="top-bar-stats-group">
          <button onClick={handleAbandonar} className="abort-mission-btn">ABORTAR MISIÓN</button>
          <DarkCard className="score-counter-card">
            <div className="score-team red-team"><div className="team-dot" /><span className="score-text">{rojoDescubiertos}/{totalRojo}</span></div>
            <span className="score-separator">vs</span>
            <div className="score-team blue-team"><div className="team-dot" /><span className="score-text">{azulDescubiertos}/{totalAzul}</span></div>
          </DarkCard>
          <div className="current-turn-badge"><span>TURNO EQUIPO {turnoActual?.toUpperCase() || "..."}</span></div>
        </div>
        <div className="role-badge-row"><div className="agent-role-badge"><span>{esJefe ? "JEFE" : "AGENTE"} — {equipo?.toUpperCase()}</span></div></div>
        {tiempoRestante !== null && (
          <DarkCard className="game-timer-card">
            <Clock className="timer-icon" /><span className="timer-clock-text">{formatearTiempo(tiempoRestante)}</span>
          </DarkCard>
        )}
      </div>

      <div className="agent-main-layout">
        <div className="board-and-voting-area">
          <ManilaFolder>
            <div className="board-grid-5cols">
              {cartas.map((carta) => (
                <GameCard
                  key={carta.id_carta_tablero}
                  carta={carta}
                  isSelected={cartaSeleccionada === carta.id_carta_tablero}
                  isRevealed={carta.estado === "revelada"}
                  canSelect={puedoVotar && carta.estado !== "revelada"}
                  onSelect={setCartaSeleccionada}
                  isJefe={esJefe}
                />
              ))}
            </div>
          </ManilaFolder>
        </div>

        <div className="side-panels-column">
          <ChatPanel mensajes={mensajes} onEnviar={handleEnviarMensaje} esJefe={esJefe} chatInputRef={chatInputRef} />
          {esJefe ? (
            <PanelPistaJefe onEnviarPista={handleEnviarPista} pistaEnviada={pistaEnviada} pista={pistaActual} />
          ) : (
            <PanelVotacionAgente
              pista={pistaActual}
              cartaSeleccionada={cartaSeleccionada}
              palabraSeleccionada={palabraSeleccionada}
              votosActuales={votosActuales}
              totalJugadores={3}
              onVotar={handleVotar}
              puedoVotar={puedoVotar}
            />
          )}
        </div>
      </div>
      <div className="agent-footer-row"><RedStamp text="CLASSIFIED" /></div>
    </ScreenFrame>
  );
}