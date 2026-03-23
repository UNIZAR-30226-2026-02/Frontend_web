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
        {isRevealed && carta.tipo === "A" && <Skull className="rev-icon-skull" />}
        {isRevealed && carta.tipo === "R" && <div className="rev-token token-red" />}
        {isRevealed && carta.tipo === "B" && <div className="rev-token token-blue" />}
        {isRevealed && carta.tipo === "C" && <div className="rev-token token-neutral" />}

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
            background: carta.tipo === "R" ? "#cc3333"
              : carta.tipo === "B" ? "#3366cc"
              : carta.tipo === "A" ? "#000"
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
          <div key={i} className={`message-row ${m.esPropio ? "message-own" : ""}`}>
            <div className={`message-bubble ${m.esPropio ? "bubble-own" : m.esSystem ? "bubble-system" : "bubble-default"}`}>
              <div className="message-meta-info">
                <span className="message-username">{m.tag || "Agente"}</span>
                <span className="message-timestamp">{m.hora}</span>
              </div>
              {!m.esValido && !m.esSystem ? (
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
            <p className="clue-word-value highlight">{pista.palabraPista}</p>
          </div>
          <div className="clue-divider" />
          <div>
            <span className="clue-label">CANTIDAD:</span>
            <p className="clue-number-value">{pista.pistaNumero}</p>
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
              // RF-15: Solo una palabra (sin espacios)
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
          <p className="clue-word-value highlight">{pista.palabraPista}</p>
        </div>
        <div className="clue-divider" />
        <div>
          <span className="clue-label">CARTAS:</span>
          <p className="clue-number-value">{pista.pistaNumero}</p>
        </div>
      </div>

      {/* Votos en tiempo real (RF-17) */}
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

  // Estado del jugador en esta partida
  const [rol, setRol] = useState(null);         // "jefe" | "agente"
  const [equipo, setEquipo] = useState(null);   // "rojo" | "azul"
  const [equipoInicial, setEquipoInicial] = useState(null);

  // Estado del tablero (RF-14)
  const [cartas, setCartas] = useState([]);
  const [estadoPartida, setEstadoPartida] = useState(null);
  const [turnoActual, setTurnoActual] = useState(null);
  const [rojoGana, setRojoGana] = useState(null);

  // Pista actual (RF-15)
  const [pistaActual, setPistaActual] = useState(null);
  const [pistaEnviada, setPistaEnviada] = useState(false);

  // Votación (RF-16/17)
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [votosActuales, setVotosActuales] = useState([]);
  const [miVotoEnviado, setMiVotoEnviado] = useState(false);

  // Chat (RF-23)
  const [mensajes, setMensajes] = useState([]);

  // Temporizador (RF-26)
  const [tiempoRestante, setTiempoRestante] = useState(null);

  // Fin de partida
  const [finPartida, setFinPartida] = useState(null); // { ganador, motivo }

  // Carga
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const stompRef = useRef(null);
  const chatInputRef = useRef(null);

  // 1. Obtener rol inicial del jugador (REST)
  useEffect(() => {
    const fetchRol = async () => {
      try {
        const res = await fetch(`${API_BASE}/partida/${idPartida}/participantes/rol`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("No se ha podido obtener el rol");
        const data = await res.json();
        setRol(data.rol);
        setEquipo(data.equipo);
        setEquipoInicial(data.equipoInicial);
      } catch (err) {
        setError(err.message);
      }
    };
    if (idPartida) fetchRol();
  }, [idPartida]);

  // 2. Obtener estado inicial del tablero (RNF-1 reconexión)
  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const res = await fetch(`${API_BASE}/partidas/${idPartida}/estado`, {
          credentials: "include"
        });
        if (!res.ok) return; // Si no existe, el WS lo cubrirá
        const data = await res.json();
        aplicarEstadoTablero(data);
      } catch (err) {
        console.warn("Estado inicial no disponible, esperando WS", err);
      } finally {
        setCargando(false);
      }
    };
    if (idPartida && rol) fetchEstado();
  }, [idPartida, rol]);

  const aplicarEstadoTablero = useCallback((data) => {
    if (data.tablero) setCartas(data.tablero);
    if (data.estado) setEstadoPartida(data.estado);
    if (data.turno_actual !== undefined) setTurnoActual(data.turno_actual);
    if (data.rojoGana !== undefined) setRojoGana(data.rojoGana);
  }, []);

  // 3. Conectar WebSockets
  useEffect(() => {
    if (!idPartida || !rol || !equipo) return;

    const token = sessionStorage.getItem("jwt_token");
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000, // RNF-1: reconexión automática
      onConnect: () => {
        console.log("Conectado a la partida", idPartida);

        // Estado del tablero
        client.subscribe(`/topic/partidas/${idPartida}/estado`, (msg) => {
          const data = JSON.parse(msg.body);
          aplicarEstadoTablero(data);
          setMiVotoEnviado(false); // Reset al cambiar estado
          setCartaSeleccionada(null);
        });

        // Temporizador (RF-26)
        client.subscribe(`/topic/partidas/${idPartida}/temporizador`, (msg) => {
          const data = JSON.parse(msg.body);
          setTiempoRestante(data.segundos_restantes ?? data);
        });

        // Pista (RF-15) — agentes reciben la pista
        client.subscribe(`/topic/partidas/${idPartida}/pista`, (msg) => {
          const data = JSON.parse(msg.body);
          setPistaActual(data);
          setPistaEnviada(false);
          setMiVotoEnviado(false);
          setCartaSeleccionada(null);
          setVotosActuales([]);
        });

        // Votos en tiempo real (RF-17)
        client.subscribe(`/topic/partidas/${idPartida}/votos`, (msg) => {
          const data = JSON.parse(msg.body);
          setVotosActuales(data.votos_actuales || []);
        });

        // Chat del equipo (RF-23)
        client.subscribe(
          `/topic/partidas/${idPartida}/chat/${equipo.toLowerCase()}`,
          (msg) => {
            const data = JSON.parse(msg.body);
            const hora = new Date().toLocaleTimeString("es", {
              hour: "2-digit", minute: "2-digit"
            });
            setMensajes((prev) => [...prev, {
              tag: data.tag || "Agente",
              mensaje: data.mensaje,
              hora,
              esValido: data.esValido !== false,
              esPropio: data.id_google === user?.id_google,
              esSystem: false
            }]);
          }
        );

        // Fin de partida
        client.subscribe(`/topic/partidas/${idPartida}/fin`, (msg) => {
          const data = JSON.parse(msg.body);
          setFinPartida(data);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setError("Conexión perdida con el servidor. Reconectando...");
      },
      onWebSocketClose: () => {
        // RNF-1: intentará reconectar automáticamente por reconnectDelay
        console.warn("WS desconectado, reconectando...");
      }
    });

    client.activate();
    stompRef.current = client;

    return () => client.deactivate();
  }, [idPartida, rol, equipo, aplicarEstadoTablero, user?.id_google]);

  // Acciones

  // RF-15: Jefe envía pista
  const handleEnviarPista = useCallback((palabra, numero) => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/app/partidas/${idPartida}/pista`,
      body: JSON.stringify({ palabraPista: palabra, pistaNumero: numero })
    });
    setPistaActual({ palabraPista: palabra, pistaNumero: numero });
    setPistaEnviada(true);
  }, [idPartida]);

  // RF-16: Agente vota carta
  const handleVotar = useCallback((idCarta) => {
    if (!stompRef.current?.connected || !idCarta || miVotoEnviado) return;
    stompRef.current.publish({
      destination: `/app/partidas/${idPartida}/votar`,
      body: JSON.stringify({ id_carta_tablero: idCarta })
    });
    setMiVotoEnviado(true);
  }, [idPartida, miVotoEnviado]);

  // RF-23: Agente envía mensaje
  const handleEnviarMensaje = useCallback((texto) => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/app/partidas/${idPartida}/chat`,
      body: JSON.stringify({ mensaje: texto })
    });
  }, [idPartida]);

  // RF-11: Abandonar partida
  const handleAbandonar = async () => {
    const confirmado = window.confirm(
      "¿Está seguro de que quiere abandonar la partida? Se aplicará una penalización de balas."
    );
    if (!confirmado) return;

    try {
      await fetch(`${API_BASE}/partidas/${idPartida}/participantes`, {
        method: "DELETE",
        credentials: "include"
      });
    } catch (err) {
      console.error("Error al abandonar:", err);
    }
    navigate("/home");
  };

  //Cálculos derivados
  const esJefe = rol === "jefe";
  const esMiTurno = turnoActual === equipo;
  const puedoVotar = !esJefe && esMiTurno && !miVotoEnviado && pistaActual;

  const cartaSeleccionadaObj = cartas.find(
    (c) => c.id_carta_tablero === cartaSeleccionada
  );
  const palabraSeleccionada = cartaSeleccionadaObj?.palabra;

  const rojoDescubiertos = cartas.filter(
    (c) => c.tipo === "R" && c.estado === "revelada"
  ).length;
  const azulDescubiertos = cartas.filter(
    (c) => c.tipo === "B" && c.estado === "revelada"
  ).length;
  const totalRojo = cartas.filter((c) => c.tipo === "R").length;
  const totalAzul = cartas.filter((c) => c.tipo === "B").length;

  // Render
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

      {/*Overlay Fin de Partida*/}
      {finPartida && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <div className={`end-game-stamp ${finPartida.ganador === equipo ? "win-stamp" : "lose-stamp"}`}>
              {finPartida.ganador === equipo ? (
                <Check className="end-game-icon" />
              ) : (
                <Skull className="end-game-icon" />
              )}
              <p className="end-game-title">
                {finPartida.ganador === equipo ? "MISIÓN COMPLETADA" : "MISIÓN FALLIDA"}
              </p>
              <p className="end-game-subtitle">
                {finPartida.motivo === "asesino_revelado"
                  ? "El Asesino ha sido revelado"
                  : `Equipo ${finPartida.ganador === "rojo" ? "Rojo" : "Azul"} descubrió todos sus agentes`}
              </p>
            </div>
            <button onClick={() => navigate("/home")} className="view-report-btn">
              <span>VOLVER AL HOME</span>
            </button>
          </div>
        </div>
      )}

      {/* Error de conexión */}
      {error && (
        <div style={{
          position: "fixed", top: "4rem", left: "50%", transform: "translateX(-50%)",
          backgroundColor: "rgba(139,32,32,0.9)", border: "1px solid #8b2020",
          borderRadius: "2px", padding: "0.5rem 1rem", zIndex: 60
        }}>
          <p style={{ fontFamily: "var(--font-courier)", color: "#e08080", fontSize: "11px" }}>
            {error}
          </p>
        </div>
      )}

      {/* Top bar */}
      <div className="agent-top-bar">
        <div className="top-bar-stats-group">
          {/* Botón Abortar (RF-11) */}
          <button onClick={handleAbandonar} className="abort-mission-btn">
            <span>ABORTAR MISIÓN</span>
          </button>

          {/* Marcador */}
          <DarkCard className="score-counter-card">
            <div className="score-team red-team">
              <div className="team-dot" />
              <span className="score-text">{rojoDescubiertos}/{totalRojo}</span>
            </div>
            <span className="score-separator">vs</span>
            <div className="score-team blue-team">
              <div className="team-dot" />
              <span className="score-text">{azulDescubiertos}/{totalAzul}</span>
            </div>
          </DarkCard>

          {/* Turno actual */}
          <div className="current-turn-badge">
            <span>TURNO EQUIPO {turnoActual?.toUpperCase() || "..."}</span>
          </div>
        </div>

        {/* Role badge */}
        <div className="role-badge-row">
          <div className="agent-role-badge">
            <span>
              {esJefe ? "JEFE DE ESPIONAJE" : "AGENTE DE CAMPO"} —
              EQUIPO {equipo?.toUpperCase() || "..."}
              {esJefe && " — VISTA CLASIFICADA"}
            </span>
          </div>
        </div>

        {/* Temporizador (RF-26) */}
        {tiempoRestante !== null && (
          <DarkCard className="game-timer-card" style={{
            ...(tiempoRestante <= 10 ? {
              borderColor: "#cc3333",
              background: "rgba(139,32,32,0.3)"
            } : {})
          }}>
            <Clock className="timer-icon" />
            <span className="timer-clock-text" style={{
              color: tiempoRestante <= 10 ? "#e08080" : "#d4b878"
            }}>
              {formatearTiempo(tiempoRestante)}
            </span>
          </DarkCard>
        )}
      </div>

      {/* Layout principal*/}
      <div className="agent-main-layout">

        {/* Tablero (RF-14) */}
        <div className="board-and-voting-area">
          <ManilaFolder>
            <div className="board-container">
              <div className="board-grid-5cols">
                {cartas.map((carta) => {
                  const isRevealed = carta.estado === "revelada";
                  const canSelect = !esJefe && esMiTurno && !isRevealed && !!pistaActual && !miVotoEnviado;

                  return (
                    <GameCard
                      key={carta.id_carta_tablero}
                      carta={carta}
                      isSelected={cartaSeleccionada === carta.id_carta_tablero}
                      isRevealed={isRevealed}
                      canSelect={canSelect}
                      onSelect={setCartaSeleccionada}
                      isJefe={esJefe}
                    />
                  );
                })}
              </div>

              {/* Leyenda del jefe */}
              {esJefe && (
                <div style={{
                  display: "flex", justifyContent: "center", gap: "1rem",
                  marginTop: "0.75rem", paddingTop: "0.5rem",
                  borderTop: "1px solid rgba(138,122,96,0.2)", flexWrap: "wrap"
                }}>
                  {[
                    { label: "AGENTE ROJO", color: "#cc3333", bg: "rgba(204,51,51,0.2)" },
                    { label: "AGENTE AZUL", color: "#3366cc", bg: "rgba(51,102,204,0.2)" },
                    { label: "CIVIL", color: "#777", bg: "rgba(119,119,119,0.2)" },
                    { label: "ASESINO", color: "#000", bg: "rgba(10,10,10,0.8)" },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <div style={{
                        width: "0.75rem", height: "0.75rem", borderRadius: "0.125rem",
                        border: `2px solid ${s.color}`, backgroundColor: s.bg
                      }} />
                      <span style={{ fontFamily: "var(--font-courier)", color: "#6a5a40", fontSize: "9px" }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ManilaFolder>
        </div>

        {/* Panel lateral */}
        <div className="side-panels-column">

          {/* Chat */}
          <ChatPanel
            mensajes={mensajes}
            onEnviar={handleEnviarMensaje}
            esJefe={esJefe}
            chatInputRef={chatInputRef}
          />

          {/* Panel según rol */}
          {esJefe ? (
            <PanelPistaJefe
              onEnviarPista={handleEnviarPista}
              pistaEnviada={pistaEnviada}
              pista={pistaActual}
            />
          ) : (
            <PanelVotacionAgente
              pista={pistaActual}
              cartaSeleccionada={cartaSeleccionada}
              palabraSeleccionada={palabraSeleccionada}
              votosActuales={votosActuales}
              totalJugadores={3} // TODO: obtener del estado del backend
              onVotar={handleVotar}
              puedoVotar={puedoVotar}
            />
          )}

        </div>
      </div>

      <div className="agent-footer-row">
        <RedStamp text={esJefe ? "TOP SECRET" : "CLASSIFIED"} className="classified-stamp-effect" />
      </div>
    </ScreenFrame>
  );
}