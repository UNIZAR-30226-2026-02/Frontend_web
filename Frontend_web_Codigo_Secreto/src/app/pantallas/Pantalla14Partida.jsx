/*
 * Pantalla unificada de partida (RF-13, RF-14, RF-15, RF-16, RF-17, RF-18, RF-26)
 * Muestra la vista del Agente o del Jefe según el rol asignado automáticamente por el backend.
 * 
 * Flujo de juego corregido según especificación:
 * - El Jefe da una pista (palabra + número N).
 * - Los agentes votan UNA carta por ronda.
 * - Si aciertan (carta de su equipo) y N > 1, el turno sigue y pueden votar otra carta.
 * - Si aciertan la última (N=1), la pista se completa, el Jefe puede dar otra pista sin cambiar de turno.
 * - Si fallan (carta del otro equipo, civil o asesino), el turno cambia al otro equipo y se limpia la pista.
 */

import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useSound } from "../hooks/useSound";
import { obtenerPerfil, obtenerPersonalizaciones } from "../api/apiJugador";

import {
  Clock, Send as SendIcon, Check, Vote, Skull,
  AlertTriangle, EyeOff, ArrowLeft, Loader2
} from "lucide-react";

import { ScreenFrame, ManilaFolder, DarkCard, RedStamp } from "../components/ScreenFrame";
import { UserContext } from "../components/UserContext";
import "../components/Partidas.css";

// Configuración de conexión WebSocket y API
const WS_URL = import.meta.env.VITE_WS_URL;
const API_BASE = import.meta.env.VITE_API_URL;

/*const isSimulacion = false; // Lo añadimos para simular la partida sin que las fotos vengan del backend, para el video. Cambiar a false luego
const simulatedCardImages = [
  carta1, carta2, carta3, carta4, carta5, carta6, carta7, carta8, carta9, carta10,
  carta11, carta12, carta13, carta14, carta15, carta16, carta17, carta18, carta19, carta20
];*/

const TEMAS_VISUALES = [
  { id: "gold", name: "Oro envejecido", color: "#d4af37", borderColor: "#b8941f", bgColor: "#2a2518" },
  { id: "sage", name: "Verde salvia", color: "#8a9a5b", borderColor: "#6d7a45", bgColor: "#1a2218" },
  { id: "terracotta", name: "Terracota cálida", color: "#c65d3b", borderColor: "#a04a2a", bgColor: "#2a1c18" },
  { id: "purple", name: "Púrpura real", color: "#8b5a8b", borderColor: "#6d456d", bgColor: "#221822" },
  { id: "rose", name: "Cuarzo rosa", color: "#c67b8a", borderColor: "#a05060", bgColor: "#2a1820" },
];

/**
 * Formatea segundos a formato MM:SS
 * @param {number} seconds - Segundos totales
 * @returns {string} Tiempo formateado
 */
function formatearTiempo(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Componente que representa una carta del tablero.
 * Muestra la imagen, la palabra y según el rol (jefe/agente) puede mostrar el color oculto.
 * También muestra el fingerprint (Check) cuando está seleccionada.
 */
function GameCard({ carta, position, isSelected, isRevealed, canSelect, onSelect, onPreview, isJefe, cardBorderColor }) {
  // Clase CSS dinámica según el estado y tipo de carta
  // Si está revelada: muestra el color real (rojo/azul/asesino/civil)
  // Si es jefe y no revelada: muestra una previsualización del color (borde inferior)
  // Si no: estilo neutral
  const imageUrl = carta.palabra;
  const colorClass = isRevealed
    ? `card-revealed color-${carta.tipo}` 
    : isJefe && carta.tipo
    ? `card-jefe-preview color-${carta.tipo}`
    : "card-idle";
  const disabled = !canSelect && !isRevealed;
  const clickTimeout = useRef(null);
  

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      if (canSelect && onSelect) {
        onSelect({ id: carta.id_carta_tablero, position });
      }
      return;
    }

    clickTimeout.current = window.setTimeout(() => {
      clickTimeout.current = null;
      if (onPreview && imageUrl) {
        onPreview(imageUrl);
      }
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
      }
    };
  }, []);

  return (
    <div
      className={`game-card ${colorClass} ${isSelected ? "card-selected" : ""} ${disabled && !isJefe ? "card-disabled" : ""}`}
      style={{ cursor: canSelect ? "pointer" : "default",
        // Propiedades de estilo para el marco personalizado
        border: `9px solid ${cardBorderColor}`, // Grosor y color del borde
        borderRadius: "6px",                     // Suaviza las esquinas
        boxShadow: `0 0 8px ${cardBorderColor}60` // Ligero resplandor del mismo color
       }}
    >
      {/* Parte superior: imagen o iconos de revelado, de forma cuadrada */}
      <div className="card-inner-top" style={{ position: "relative", overflow: "hidden",
          aspectRatio: "1 / 1", }}>
        {/* Imagen de fondo (siempre visible) */}
        {imageUrl && (
          <div className="card-image-wrapper" onClick={!isRevealed ? handleCardClick : undefined}>
            <img
              src={imageUrl}
              alt={carta.palabra || "Carta"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: isSelected && !isRevealed ? 0.7 : 1,
                cursor: !isRevealed ? "zoom-in" : "default",
              }}
            />
          </div>
        )}
        {isRevealed && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor:
                tipoLower === "rojo"
                  ? "rgba(204, 51, 51, 0.8)"
                  : tipoLower === "azul"
                  ? "rgba(51, 102, 204, 0.8)"
                  : tipoLower === "civil"
                  ? "rgba(119, 119, 119, 0.8)"
                  : tipoLower === "asesino"
                  ? "rgba(0, 0, 0, 0.9)"
                  : "transparent",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        )}

        {/* Iconos/tokens cuando la carta está revelada - superpuestos sobre la imagen 
        {isRevealed && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 15,
          }}>
            {carta.tipo === "asesino" && <Skull className="rev-icon-skull" />}
            {carta.tipo === "rojo" && <div className="rev-token token-red" />}
            {carta.tipo === "azul" && <div className="rev-token token-blue" />}
            {carta.tipo === "civil" && <div className="rev-token token-neutral" />}
          </div>
        )} */}

        {/* FINGERPRINT (Check)  */}
        {isSelected && !isRevealed && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.6)", // Fondo oscuro semitransparente para resaltar
            zIndex: 10, // Asegura que esté por encima de la imagen
          }}>
            <Check style={{
              width: "3rem",
              height: "3rem",
              color: "#d4b878", // Color dorado
              filter: "drop-shadow(0 0 2px black)",
            }} />
          </div>
        )}

        {/* Vista del Jefe: borde inferior de color para identificar el tipo oculto */}
        {isJefe && !isRevealed && carta.tipo && (
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: carta.tipo === "rojo" ? "#cc3333"
              : carta.tipo === "azul" ? "#3366cc"
              : carta.tipo === "asesino" ? "#000"
              : "#666",
            zIndex: 5,
          }} />
        )}
      </div>
      
    </div>
  );
}

/**
 * Componente del chat en tiempo real.
 * Los agentes pueden enviar mensajes; el jefe solo puede leer (modo solo lectura).
 */
function ChatPanel({ mensajes, onEnviar, esJefe, chatInputRef }) {
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef(null);

  // Auto-scroll al recibir nuevos mensajes
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

/**
 * Panel para que el Jefe de Espionaje pueda dar una pista.
 * Solo visible cuando no hay una pista activa (pistaEnviada === false).
 */
function PanelPistaJefe({ onEnviarPista, pistaEnviada, pista, esMiTurno }) {
  const [palabra, setPalabra] = useState("");
  const [numero, setNumero] = useState(2);
  // Limpiar el formulario cuando se pueda enviar una nueva pista
  useEffect(() => {
    if (!pistaEnviada) {
      setPalabra("");
      setNumero(2);
    }
  }, [pistaEnviada]);

  const handleSend = () => {
    if (!palabra.trim()) return;
    onEnviarPista(palabra.trim().toUpperCase(), numero);
  };

  // Si ya se envió una pista y está activa, mostrar resumen
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
            <span className="clue-label">CARTAS:</span>
            <p className="clue-number-value">{pista.pista_numero}</p>
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-courier)", color: "#888", fontSize: "10px", marginTop: "0.5rem" }}>
          Esperando votación de los agentes...
        </p>
      </DarkCard>
    );
  }

  // Si no es el turno de su equipo no puede enviar pista.
  if (!esMiTurno) {
    return (
      <DarkCard className="voting-action-panel">
        <div className="no-votes-alert" style={{ marginBottom: "0.75rem", justifyContent: "center" }}>
          <AlertTriangle className="alert-icon-sm" />
          <span className="alert-text-xs">NO ES TU TURNO</span>
        </div>
        <p style={{ fontFamily: "var(--font-courier)", color: "#888", fontSize: "11px", textAlign: "center" }}>
          Esperando a que el equipo contrario termine su turno...
        </p>
      </DarkCard>
    );
  }

  // Formulario para nueva pista
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

/**
 * Panel de votación para los agentes.
 * Muestra la pista activa, los votos actuales, la carta seleccionada y permite votar (en función
 * de si es su turno o no).
 */
function PanelVotacionAgente({ pista, cartaSeleccionada, palabraSeleccionada, votosActuales, totalJugadores, onVotar, puedoVotar }) {
  // Corrección 3: spinner mientras el Jefe analiza el tablero (sin pista activa)
  if (!pista) {
    return (
      <DarkCard className="voting-action-panel">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-[#c4a060]" />
          <p style={{ fontFamily: "var(--font-courier)", color: "#888", fontSize: "11px", textAlign: "center" }}>
            El Jefe de Espionaje está analizando el tablero...
          </p>
        </div>
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
          {/* TODO: buscar del backend el número de jugadores en ese equipo, porque no tiene
          por qué coincidir con la mitad. */}
          VOTOS ACTUALES: {votosActuales?.length || 0}/{Math.ceil((totalJugadores - 1) / 2) || "?"} 
        </span>
        <div className="vote-dots-container">
          {(votosActuales || []).map((v, i) => (
            <div key={i} className="vote-dot dot-used" title={v.tag}>
              <Check className="vote-check-icon" />
            </div>
          ))}
        </div>
      </div>

      {/* Carta seleccionada actualmente */}
      {cartaSeleccionada && (
        <div className="current-selection-badge" style={{ marginBottom: "0.75rem" }}>
          <span className="voting-label-xs">SELECCIÓN:</span>
          <p className="selected-word-display">Carta #{cartaSeleccionada.position}</p>
        </div>
      )}

      {!puedoVotar && (
        <div className="no-votes-alert" style={{ marginBottom: "0.75rem" }}>
          <AlertTriangle className="alert-icon-sm" />
          <span className="alert-text-xs">NO ES TU TURNO</span>
        </div>
      )}

      <button
        onClick={() => onVotar(cartaSeleccionada?.id)}
        disabled={!cartaSeleccionada?.id || !puedoVotar}
        className="submit-vote-btn"
        style={{ width: "100%" }}
      >
        <Vote className="vote-btn-icon" />
        <span>VOTAR CARTA</span>
      </button>
    </DarkCard>
  );
}

// Función auxiliar que evalúa si se ha revelado una carta nueva y dispara el popup de retroalimentación.
const evaluarFeedbackCartaRevelada = (cartasViejas, cartasNuevas, turnoAnterior, equipoUsuario, setFeedbackCarta, onCartaIncorrecta) => {
  if (cartasViejas.length === 0) return;
  
  console.log("equipoUsuario (recibido):", equipoUsuario);
  
  const reveladasViejas = cartasViejas.filter(c => c.estado === "revelada").length;
  const reveladasNuevas = cartasNuevas.filter(c => c.estado === "revelada").length;

  if (reveladasNuevas === reveladasViejas + 1) {
    const nuevaCarta = cartasNuevas.find(cn => 
      cn.estado === "revelada" && 
      !cartasViejas.find(cv => cv.id_carta_tablero === cn.id_carta_tablero && cv.estado === "revelada")
    );

    if (nuevaCarta) {
      console.log("Nueva carta revelada:", nuevaCarta);
      const tipoCarta = nuevaCarta.tipo?.toLowerCase();
      const equipoUsuarioNorm = equipoUsuario?.toLowerCase();
      console.log(`Comparando: tipoCarta=${tipoCarta}, equipoUsuario=${equipoUsuarioNorm}`);
      
      let mensaje = "";
      let color = "#cc3333";
      
      if (tipoCarta && equipoUsuarioNorm && tipoCarta === equipoUsuarioNorm) {
        mensaje = "¡Has encontrado a un agente amigo!";
        color = "#50a050";
        // Acierto: NO llamamos a onCartaIncorrecta
      } else if (tipoCarta === "civil") {
        mensaje = "Has encontrado a un civil";
        color = "#cccccc";
        onCartaIncorrecta?.();
      } else if (tipoCarta === "asesino") {
        mensaje = "¡Has encontrado al asesino!";
        color = "#000000";
        onCartaIncorrecta?.();
      } else {
        mensaje = "Has encontrado a un agente enemigo";
        color = "#cc3333";
        onCartaIncorrecta?.();
      }
      
      setFeedbackCarta({ mensaje, color, tipo: tipoCarta });
      setTimeout(() => setFeedbackCarta(null), 1500);
    }
  }
};

// PANTALLA PRINCIPAL DE LA PARTIDA

// Declarar los colores de prueba ANTES de usarlos en useState
const colorFondoTableroPrueba = "#967c26";
const colorBordePrueba = "#d4af37"; // Dorado / Oro envejecido

export function PantallaPartida() {
  const navigate = useNavigate();
  const { id_partida: idPartida } = useParams();
  const { user } = useContext(UserContext);
  const { playDisparo, playCancelar } = useSound();

  const [temaMarcoColor, setTemaMarcoColor] = useState(localStorage.getItem('marco_carta_equipado') || colorBordePrueba);
  const [temaTableroColor, setTemaTableroColor] = useState(localStorage.getItem('fondo_tablero_equipado') || colorFondoTableroPrueba);
  const temaMarco = { color: temaMarcoColor };
  const temaTablero = { bgColor: temaTableroColor };

  useEffect(() => {
    const cargarTemasEquipados = async () => {
  try {
    const perfil = await obtenerPerfil();
    
    if (perfil?.marco_carta_equipado) {
      let marco = perfil.marco_carta_equipado;
      // Añadir '#' si no existe
      if (marco && !marco.startsWith('#')) marco = `#${marco}`;
      setTemaMarcoColor(marco);
      localStorage.setItem('tema_marco', marco);
    }
    if (perfil?.fondo_tablero_equipado) {
      let fondo = perfil.fondo_tablero_equipado;
      if (fondo && !fondo.startsWith('#')) fondo = `#${fondo}`;
      setTemaTableroColor(fondo);
      localStorage.setItem('tema_tablero', fondo);
    }
  } catch (err) {
    console.error("Error cargando temas equipados:", err);
  }
};

    cargarTemasEquipados();
  }, []);

  // Estado del juego
  const [rol, setRol] = useState(null);          // "lider" o "agente"
  const [equipo, setEquipo] = useState(null);    // "rojo" o "azul"
  const [cartas, setCartas] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [rojoGana, setRojoGana] = useState(null);

  // Pista y votación
  const [pistaActual, setPistaActual] = useState(null);
  const [pistaEnviada, setPistaEnviada] = useState(false); // Indica si el jefe ya envió la pista actual
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [votosActuales, setVotosActuales] = useState([]);
  const [miVotoEnviado, setMiVotoEnviado] = useState(false);
  const [totalRojo, setTotalRojo] = useState(0);
  const [totalAzul, setTotalAzul] = useState(0);
  // Estados para la fase y el marcador
  const [faseTurno, setFaseTurno] = useState(null);
  const [cartasRojasRestantes, setCartasRojasRestantes] = useState(0);
  const [cartasAzulesRestantes, setCartasAzulesRestantes] = useState(0);

  // Chat y tiempo
  const [mensajes, setMensajes] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const stompRef = useRef(null);
  const chatInputRef = useRef(null);

  const equipoRef = useRef(equipo);
  useEffect(() => { equipoRef.current = equipo; }, [equipo]);

  // Estados para el feedback de carta revelada
  const [feedbackCarta, setFeedbackCarta] = useState(null);

  // Guardamos las cartas anteriores y el turno sin provocar re-renderizados, para poder
  // detectar si la carta revelada era de un equipo u otro.
  const cartasAnterioresRef = useRef([]);
  const turnoAnteriorRef = useRef(null);

  // Sincronizamos las refs cada vez que las variables oficiales cambien.
  useEffect(() => { 
    cartasAnterioresRef.current = cartas; 
  }, [cartas]);

  useEffect(() => { 
    turnoAnteriorRef.current = turnoActual; 
  }, [turnoActual]);

  // ------------------------------------------------------------
  // 1. OBTENER ROL DEL USUARIO EN LA PARTIDA
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchRol = async () => {
      try {
        const res = await fetch(`${API_BASE}/partidas/${idPartida}/participantes/rol`, {
          credentials: "include"
        });
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error("No se ha podido obtener el rol");
        }
        const data = await res.json();
        setRol(data.rol);
        setEquipo(data.equipo);
        // Importante. Para mostrar el marcador en la partida, hay que saber qué equipo empieza
        // y asignarle 8 o 9 cartas. Se obtiene el equipo del primer turno, que empieza y tiene
        // una carta más que desvelar que el otro equipo. No sirve con mirar el tipo de las cartas
        // para ver cuántas hay rojas o azules, ya que los agentes reciben el tipo como null.
        if (data.equipo_inicial !== undefined){
          setTotalRojo(data.equipo_inicial === "rojo" ? 9 : 8);
          setTotalAzul(data.equipo_inicial === "rojo" ? 8 : 9);
        }
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };
    if (idPartida) fetchRol();
  }, [idPartida]);

  // ------------------------------------------------------------
  // 2. FUNCIÓN PARA APLICAR ESTADO DEL TABLERO DESDE BACKEND
  //    Maneja la lógica de turnos y pistas según el flujo corregido.
  // ------------------------------------------------------------
  const aplicarEstadoTablero = useCallback((data) => {

    // Comprobación de finalización de partida
    if (data.estado === 'finalizada') {
      navigate(`/fin-partida/${idPartida}`);
      return; // Detenemos la ejecución, ya no importa el resto del tablero
    }

    // Actualizar cartas
    if (data.tablero?.cartas){
      // Importante: el backend da las cartas desordenadas (en función de su fecha de actualización)
      // y hay que ordenarlas para que siempre se muestren en el tablero en el mismo orden.
      const sortedCartas = [...data.tablero.cartas].sort((a, b) => a.id_carta_tablero - b.id_carta_tablero);
      
      // Función para evaluar qué tiene que mostrar en el modal de retroalimentación para el usuario.
      evaluarFeedbackCartaRevelada(cartasAnterioresRef.current, sortedCartas, turnoAnteriorRef.current, equipoRef.current,
                                                                                   setFeedbackCarta, playDisparo);
      
      const cartasConSimulacion = sortedCartas.map((carta, index) => ({
        ...carta,
        imagen_url: carta.palabra || carta.palabra /*|| (isSimulacion ? simulatedCardImages[index % simulatedCardImages.length] : carta.imagen_url)*/,
        palabra: /*isSimulacion ? (carta.palabra || `Carta ${carta.id_carta_tablero}`) :*/ carta.palabra,
      }));
      setCartas(cartasConSimulacion);
    } 
    // Actualizar turno actual
    if (data.equipo_turno_actual !== undefined) setTurnoActual(data.equipo_turno_actual);
    console.log("Turno actual:", data.equipo_turno_actual);
    if (data.rojo_gana !== undefined) setRojoGana(data.rojo_gana);  

    // Mirar 'fase_turno' para ver si se está esperando la pista o votando.
    if (data.fase_turno !== undefined) setFaseTurno(data.fase_turno);
  
    // Utilizar 'cartasRojasRestantes' y 'cartasAzulesRestantes' para mostrar el marcador de cada equipo.
    if (data.cartas_rojas_restantes !== undefined) setCartasRojasRestantes(data.cartas_rojas_restantes);
    if (data.cartas_azules_restantes !== undefined) setCartasAzulesRestantes(data.cartas_azules_restantes);

    // Manejo de pista actual:
    // - Si el backend envía una pista, significa que estamos en medio de una votación.
    // - Si no hay pista (null), el turno actual puede continuar (si se acertó una carta y quedan más)
    //   o ha cambiado de equipo. En cualquier caso, se permite al jefe dar una nueva pista.
    if (data.pista_actual) {
      setPistaActual(data.pista_actual);
      setPistaEnviada(true);      // El jefe ya envió esta pista
    } else {
      // Corrección 1 (Bug 2): limpiar estado local del agente cuando no hay pista activa.
      // Esto cubre el cambio de equipo y el inicio de turno (fase esperando_pista).
      setPistaActual(null);
      setPistaEnviada(false);       // El jefe puede dar una nueva pista
      setMiVotoEnviado(false);      // Permitir votar en la siguiente ronda
      setCartaSeleccionada(null);   // Limpiar selección anterior del tablero
    }

    // Actualizar votos si vienen
    if (data.votos_turno_actual) setVotosActuales(data.votos_turno_actual);
  }, [navigate, idPartida, /*isSimulacion, simulatedCardImages*/]); // Dependencias necesarias para la redirección a fin de partida.

  // ------------------------------------------------------------
  // 3. OBTENER ESTADO INICIAL DE LA PARTIDA (REST)
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // 4. LIMPIAR SELECCIÓN Y VOTO LOCAL CUANDO CAMBIA EL TURNO O LA FASE
  //    Corrección 2 (Bug 1): también resetea cuando faseTurno pasa a "esperando_pista",
  //    lo que cubre el cambio de equipo y el inicio de cada turno.
  // ------------------------------------------------------------
  useEffect(() => {
    if (turnoActual !== equipo || faseTurno === "esperando_pista") {
      setCartaSeleccionada(null);
      setMiVotoEnviado(false);
    }
  }, [turnoActual, equipo, faseTurno]);

  // ------------------------------------------------------------
  // 5. WEBSOCKETS: SUSCRIPCIÓN A EVENTOS EN TIEMPO REAL
  // ------------------------------------------------------------
  useEffect(() => {
    if (!idPartida || !rol || !equipo) return;

    const token = sessionStorage.getItem("jwt_token");
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        // Estado general del tablero (cartas reveladas, turno, pista, votos)
        // IMPORTANTE: cada usuario se suscribe a su propio canal para que el backend
        // le envía el estado del tablero personalizado (mostrando la identidad de las 
        // cartas o no en función de si es jefe o agente).
        client.subscribe(`/topic/partidas/${idPartida}/estado`, (msg) => {
          /*const data = JSON.parse(msg.body);
          
          // Comprobación de finalización de partida
          if (data.estado === 'finalizada') {
            navigate(`/fin-partida/${idPartida}`);
            return; // Detenemos la ejecución, ya no importa el resto del tablero
          }*/

          const payload = msg.body;
          
          // Si es exactamente "finalizada" (case-insensitive), redirigir
          if (payload.toLowerCase() === 'finalizada') {
            navigate(`/fin-partida/${idPartida}`);
            return;
          }
          
          try {
            const data = JSON.parse(payload);
            if (data.estado === 'finalizada') {
              navigate(`/fin-partida/${idPartida}`);
              return;
            }
          } catch (error) {
            console.error("Error al parsear el estado:", error);
          }
        });

        client.subscribe(`/user/queue/partidas/${idPartida}/estado`, (msg) => {
          const payload = msg.body;
          
          // Si es exactamente "finalizada" (case-insensitive), redirigir
          if (payload.toLowerCase() === 'finalizada') {
            navigate(`/fin-partida/${idPartida}`);
            return;
          }
          
          try {
            const data = JSON.parse(payload);
            if (data.estado === 'finalizada') {
              navigate(`/fin-partida/${idPartida}`);
              return;
            }
            aplicarEstadoTablero(data);
          } catch (error) {
            console.error("Error al parsear el estado:", error);
          }
        });

        // Temporizador del turno
        client.subscribe(`/topic/partidas/${idPartida}/temporizador`, (msg) => {
          const data = JSON.parse(msg.body);
          setTiempoRestante(data.segundos_restantes);
        });

        // Nueva pista (solo cuando el jefe la envía)
        // En la suscripción a la pista (asegurar que se resetea el estado)
        // TODO: revisar este endpoint.
        client.subscribe(`/topic/partidas/${idPartida}/pista`, (msg) => {
          const data = JSON.parse(msg.body);
          setPistaActual(data);
          setPistaEnviada(true);
          setMiVotoEnviado(false);   // Nuevo turno de votación, se puede volver a votar
          setCartaSeleccionada(null);
          setVotosActuales([]);
        });

        // Actualización de votos en tiempo real
        // TODO: borrar esta suscripción. No hace falta porque la actualización de los
        // votos se recibe en el estado general de la partida.
        /*client.subscribe(`/topic/partidas/${idPartida}/votos`, (msg) => {
          const data = JSON.parse(msg.body);
          setVotosActuales(data.votos_actuales || []);
        });*/

        // Mensajes de chat del equipo
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

        // Fin de la partida
        // TODO: no hace falta esto porque el final de la partida se notifica con el estado
        // 'finalizada'.
        /*client.subscribe(`/topic/partidas/${idPartida}/fin`, (msg) => {
          const data = JSON.parse(msg.body);
          setFinPartida(data);
        });*/
      }
    });

    client.activate();
    stompRef.current = client;
    return () => client.deactivate();
  }, [idPartida, rol, equipo, aplicarEstadoTablero, user?.id_google]);

  // ------------------------------------------------------------
  // ACCIONES (ENVÍOS POR WEBSOCKET)
  // ------------------------------------------------------------

  /**
   * El Jefe envía una nueva pista.
   * @param {string} palabra - Palabra clave de la pista
   * @param {number} numero - Número de cartas relacionadas
   */
  const handleEnviarPista = useCallback((palabra, numero) => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/app/partidas/${idPartida}/pista`,
      body: JSON.stringify({ palabra_pista: palabra, pista_numero: numero })
    });
    // Actualización optimista local
    setPistaActual({ palabra_pista: palabra, pista_numero: numero });
    setPistaEnviada(true);
  }, [idPartida]);



  /**
   * Un agente vota por una carta.
   * @param {number} id_carta - ID de la carta seleccionada
   */
  const handleVotar = useCallback((id_carta) => {
    // Si no estoy conectado, no tengo carta, ya voté o la fase no es correcta, bloquear.
  //if (!stompRef.current?.connected || !id_carta || miVotoEnviado || !pistaActual) return;
  if (!stompRef.current?.connected || !id_carta || miVotoEnviado || !pistaActual) return;
  //const idTurno = pistaActual.idTurno; // ESTO NO SE SI DEBERÍA SER ASÍ PERO EL BACKEND PIDE ID_TURNO
  /*if (!idTurno) {
    console.error("No se puede votar: falta idTurno en la pista");
    return;
  }*/
  stompRef.current.publish({
    destination: `/app/partidas/${idPartida}/votar`,
    body: JSON.stringify({
      id_carta_tablero: id_carta,   
      //tag: user?.tag || "Agente",
      //equipo: equipo,
      //idTurno: idTurno
    })
  });
  setMiVotoEnviado(true);
}, [idPartida, miVotoEnviado, pistaActual/*puedoVotar*/]);

    /**
   * Enviar mensaje al chat del equipo.
   * @param {string} texto - Contenido del mensaje
   */
  const handleEnviarMensaje = useCallback((texto) => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/app/partidas/${idPartida}/chat`,
      body: JSON.stringify({ mensaje: texto })
    });
  }, [idPartida]);

  /**
   * Abandonar la partida (llamada REST DELETE).
   */
  const handleAbandonar = async () => {
    if (!window.confirm("¿Está seguro de que quiere abandonar la partida?")) {
      playCancelar();
      return;
    }

    playCancelar();
    try {
      await fetch(`${API_BASE}/partidas/${idPartida}/participantes`, {
        method: "DELETE",
        credentials: "include"
      });
      navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------------------------------------------------
  // VARIABLES DERIVADAS PARA RENDERIZADO
  // ------------------------------------------------------------
  const esJefe = rol === "lider";
  const esMiTurno = turnoActual === equipo;
  //const puedoVotar = !esJefe && esMiTurno && !miVotoEnviado && pistaActual !== null;
  const puedoVotar = !esJefe && esMiTurno && faseTurno === "votando" && !miVotoEnviado;

  console.log("esJefe: " + esJefe + " | esMiTurno: " + esMiTurno + " | faseTurno: " + faseTurno + " | puedoVotar: " + puedoVotar, + miVotoEnviado);

  const cartaSeleccionadaObj = cartas.find(c => c.id_carta_tablero === cartaSeleccionada?.id);
  const palabraSeleccionada = cartaSeleccionadaObj?.palabra;

  // Conteo de cartas descubiertas para la puntuación
  const rojoDescubiertos = cartas.filter(c => c.tipo === "rojo" && c.estado === "revelada").length;
  const azulDescubiertos = cartas.filter(c => c.tipo === "azul" && c.estado === "revelada").length;

  // Estados de carga y error
  if (cargando && rol === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "var(--font-courier)", color: "#c4a060" }}>
          ESTABLECIENDO CONEXIÓN SEGURA...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "var(--font-courier)", color: "#cc3333" }}>
          ERROR: {error}
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // ------------------------------------------------------------
  return (
    <ScreenFrame title={esJefe ? "VISTA DEL JEFE DE ESPIONAJE" : "VISTA DEL AGENTE"}>

      {/* Barra superior con estadísticas y controles
      {/*<div className="agent-top-bar">
        <div className="top-bar-stats-group">
          <button onClick={handleAbandonar} className="abort-mission-btn">ABORTAR MISIÓN</button>
          <DarkCard className="score-counter-card">
            <div className="score-team red-team"><div className="team-dot" /><span className="score-text">{rojoDescubiertos}/{totalRojo}</span></div>
            <span className="score-separator">vs</span>
            <div className="score-team blue-team"><div className="team-dot" /><span className="score-text">{azulDescubiertos}/{totalAzul}</span></div>
          </DarkCard>
          <div className="current-turn-badge"><span>TURNO EQUIPO {turnoActual?.toUpperCase() || "..."}</span></div>
        </div>
        {tiempoRestante !== null && (
          <DarkCard className="game-timer-card">
            <Clock className="timer-icon" /><span className="timer-clock-text">{formatearTiempo(tiempoRestante)}</span>
          </DarkCard>
        )}
        <div className="role-badge-row"><div className="agent-role-badge"><span>{esJefe ? "JEFE" : "AGENTE"} — {equipo?.toUpperCase()}</span></div></div>
      </div> */}

      {/* Barra superior con estadísticas y controles */}
      <div className="relative flex justify-between items-center w-full mb-6 min-h-[4rem]">
        
        {/* IZQUIERDA: Botón Abortar y Marcador */}
        <div className="flex items-center gap-4 z-10">
          
          {/* Botón Abortar (Color más apagado, sin resplandor, estilo más rústico) */}
          <button 
            onClick={handleAbandonar} 
            className="px-4 py-2 bg-[#8b2020] hover:bg-[#6b1818] text-[#e8dcc8] rounded-xl border border-[#5a1515] cursor-pointer font-['Courier_Prime',monospace] font-bold tracking-widest text-sm md:text-base uppercase transition-colors"
          >
            ABORTAR MISIÓN
          </button>

          {/* Marcador Original */}
          <DarkCard className="score-counter-card">
            <div className="score-team red-team"><div className="team-dot" /><span className="score-text">{rojoDescubiertos}/{totalRojo}</span></div>
            <span className="score-separator">vs</span>
            <div className="score-team blue-team"><div className="team-dot" /><span className="score-text">{azulDescubiertos}/{totalAzul}</span></div>
          </DarkCard>
        </div>

        {/* CENTRO: Rol del Jugador */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-0">
          <span className="font-['Courier_Prime',monospace] text-sm text-[#e8dcc8] tracking-widest font-bold uppercase leading-tight">
            Eres
          </span>
          <span className="font-['Courier_Prime',monospace] text-xl text-[#e8dcc8] tracking-widest font-bold uppercase leading-tight">
            {esJefe ? "Jefe de Espías" : "Agente de Campo"}
          </span>
          <span className={`font-['Courier_Prime',monospace] text-xl tracking-widest font-bold uppercase leading-tight ${equipo === "rojo" ? "text-[#cc3333]" : "text-[#3366cc]"}`}>
            {equipo === "rojo" ? "Rojo" : equipo === "azul" ? "Azul" : ""}
          </span>
        </div>

        {/* DERECHA: Turno y Temporizador (Alineados horizontalmente) */}
        <div className="flex items-center gap-4 z-10 mr-16">
          
          {/* Turno. Se pone de color azul o rojo en función del equipo que tenga el turno actual.*/}
          <div className={`current-turn-badge ${turnoActual?.toLowerCase() || ""}`}>
            <span>TURNO {turnoActual?.toUpperCase() || "..."}</span>
          </div>

          {/* Temporizador */}
          {tiempoRestante !== null && (
            <DarkCard className="game-timer-card !m-0">
              <Clock className="timer-icon" />
              <span className="timer-clock-text">{formatearTiempo(tiempoRestante)}</span>
            </DarkCard>
          )}
        </div>
        
      </div>

      {/* Layout principal: tablero + paneles laterales */}
      <div className="agent-main-layout">
        <div className="board-and-voting-area">
        <ManilaFolder folderColor={temaTableroColor}>
          <div className="board-grid-5cols" style={{ maxWidth: "750px", margin: "0 auto" }}>
            {cartas.map((carta, index) => (
              <GameCard
                key={carta.id_carta_tablero}
                carta={carta}
                position={index + 1}
                isSelected={cartaSeleccionada?.id === carta.id_carta_tablero}
                isRevealed={carta.estado === "revelada"}
                canSelect={puedoVotar && carta.estado !== "revelada"}
                onSelect={(selection) => setCartaSeleccionada(selection)}
                onPreview={(url) => setPreviewImage(url)}
                isJefe={esJefe}
                cardBorderColor={temaMarco.color}   // ya incluye '#' porque se guardó con prefijo
              />
            ))}
          </div>
        </ManilaFolder>
        </div>

        <div className="side-panels-column">
          <ChatPanel mensajes={mensajes} onEnviar={handleEnviarMensaje} esJefe={esJefe} chatInputRef={chatInputRef} />
          {esJefe ? (
            <PanelPistaJefe onEnviarPista={handleEnviarPista} pistaEnviada={pistaEnviada} pista={pistaActual} esMiTurno={esMiTurno} />
          ) : (
            <PanelVotacionAgente
              pista={pistaActual}
              cartaSeleccionada={cartaSeleccionada}
              palabraSeleccionada={palabraSeleccionada}
              votosActuales={votosActuales}
              totalJugadores={3} // Se puede obtener dinámicamente del backend
              onVotar={handleVotar}
              puedoVotar={puedoVotar}
            />
          )}
        </div>
      </div>
      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-box" onClick={(e) => e.stopPropagation()}>
            <button className="image-preview-close" onClick={() => setPreviewImage(null)} aria-label="Cerrar vista ampliada">
              ×
            </button>
            <img src={previewImage} alt="Carta ampliada" className="image-preview-img" />
          </div>
        </div>
      )}

      {/* Popup de Retroalimentación de Carta */}
      {feedbackCarta && (
        <>
          {/* Fondo desenfocado */}
          <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-[2px]" />

          {/* Caja del modal con animación de entrada */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[90%] max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1e1810] border-2 border-[#5a4a30] rounded-sm shadow-[6px_8px_32px_rgba(0,0,0,0.8)] p-6">

              {/* Detalle del resultado */}
              <div className="bg-[#2a2218] border border-[#5a4a30]/40 rounded-sm p-5 text-center shadow-inner">
                <p
                  className="font-['Special_Elite',cursive] tracking-wide"
                  style={{ fontSize: 16, color: feedbackCarta.color }}
                >
                  {feedbackCarta.mensaje}
                </p>
              </div>
              
            </div>
          </div>
        </>
      )}

      <div className="agent-footer-row"><RedStamp text="CLASSIFIED" /></div>
    </ScreenFrame>
  );
}