/*
 * Pantalla07Lobby.jsx — VERSIÓN ACTUALIZADA
 * 
 * RF-21: Selección manual de equipo con WebSockets
 * RF-12: Código de partida mostrado; modificación de parámetros para creador (privadas)
 * RF-13: Botón de inicio solo para creador, habilitado cuando hay mínimo 2 por equipo
 * RNF-1: Carga estado inicial vía REST + actualizaciones en tiempo real vía WS
 */

import { ScreenFrame, ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader } from "../components/ScreenFrame";
import { Crown, User, Copy, ArrowLeft, Fingerprint, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { UserContext } from "../components/UserContext";
import { obtenerTemasJugador } from "../api/apiPartidas";

const WS_URL = import.meta.env.VITE_WS_URL;
const API_BASE = import.meta.env.VITE_API_URL;

// Componente de slot de jugador
function PlayerSlot({ player, teamColor }) {
  const isEmpty = !player || player.tag?.includes("Vacante");
  const colors = teamColor === "rojo"
    ? { bg: "#8b2020", text: "#e08080", border: "#a03030" }
    : { bg: "#2a3a5a", text: "#80a0d0", border: "#3a5a8a" };

  return (
    <div className={`p-2.5 sm:p-3 rounded-sm border transition-all ${isEmpty
      ? "border-dashed border-[#555] bg-[#1a1a1a]/50"
      : "border-[#444] bg-[#1a1a1a]"}`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {!isEmpty && (
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${colors.bg}30`, border: `1px solid ${colors.border}` }}
          >
            <User className="w-3.5 h-3.5" style={{ color: colors.text }} />
          </div>
        )}
        <div className="min-w-0">
          <p
            className={`font-['Courier_Prime',monospace] truncate ${isEmpty ? "text-[#555] italic" : "text-[#e8dcc8]"}`}
            style={{ fontSize: 12 }}
          >
            {isEmpty ? "— Vacante —" : player.tag}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Pantalla07Lobby() {
  const navigate = useNavigate();
  const { id_partida } = useParams();
  const { user } = useContext(UserContext);

  const partidaIniciadaRef = useRef(false);

  // Estado del lobby
  const [lobbyData, setLobbyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(false);

  // Estado editable (solo creador, solo partidas privadas)
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [tiempoSeleccionado, setTiempoSeleccionado] = useState(null);
  const [temasDisponibles, setTemasDisponibles] = useState([]);

  // Equipo del jugador actual
  const [miEquipo, setMiEquipo] = useState(null);

  const stompRef = useRef(null);

  // Soy el creador?
  const soyCreador = lobbyData?.tag_creador === user?.tag;
  const partida = lobbyData;

  //AplicO datos del lobby 
  const aplicarLobby = useCallback((data) => {
    setLobbyData(data);

    // Detectar el equipo del jugador actual
    const yo = data.jugadores?.find((j) => j.tag === user?.tag);
    if (yo) setMiEquipo(yo.equipo);

    // Si la partida ha pasado a en_curso, redirigir a la pantalla de juego
    if (data.estado === "en_curso") {
      partidaIniciadaRef.current = true;
      navigate(`/partida/${data.id_partida}`);
    }

    // Si la partida fue finalizada (creador abandonó), volver al home
    if (data.estado === "finalizada") {
      navigate("/home");
    }
  }, [user?.tag, navigate]);

  // 1. Cargar estado inicial del lobby (REST)
  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const res = await fetch(`${API_BASE}/partidas/${id_partida}/lobby`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("No se pudo cargar el lobby");
        const data = await res.json();
        aplicarLobby(data);

        // Inicializar valores editables
        setTemaSeleccionado(data.id_tema);
        setTiempoSeleccionado(String(data.tiempo_espera));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (id_partida) fetchLobby();
  }, [id_partida, aplicarLobby]);

  //2. Cargar temas del creador (para selector)
  useEffect(() => {
    if (!soyCreador) return;
    obtenerTemasJugador()
      .then(setTemasDisponibles)
      .catch(console.error);
  }, [soyCreador]);

  //3. Conectar WebSocket del lobby 
  useEffect(() => {
    if (!id_partida) return;

    const token = sessionStorage.getItem("jwt_token");
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        // Suscribirse a actualizaciones del lobby
        client.subscribe(`/topic/partidas/${id_partida}/lobby`, (msg) => {
          const data = JSON.parse(msg.body);
          aplicarLobby(data);
          setTemaSeleccionado(data.id_tema);
          setTiempoSeleccionado(String(data.tiempo_espera));
        });
      },
      onStompError: (frame) => {
        console.error("STOMP lobby error:", frame);
      }
    });

    client.activate();
    stompRef.current = client;

    // Esto es lo que se ejecuta cuando se cierra la pantalla actual (se vuelve al home o se accede
    // al perfil).
    return () => {
    // Solo avisar al backend si la partida NO ha arrancado
      if (!partidaIniciadaRef.current && stompRef.current?.connected) {
          stompRef.current.publish({
              destination: `/app/partida/${id_partida}/abandonarLobby`,
              body: JSON.stringify({})
          });
      }
      client.deactivate();
    };
  }, [id_partida, aplicarLobby]);

  // Acciones

  // RF-21: Cambiar equipo
  const handleCambiarEquipo = (equipo) => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/app/partida/${id_partida}/participantes/equipo`,
      // No hace falta poner 'equipo: equipo' porque el nombre de la variable es
      // el mismo que el del dato que espera el backend.
      body: JSON.stringify({ equipo })
    });
    setMiEquipo(equipo);
  };

  // Cambiar tema (solo creador, solo privadas)
  const handleCambiarTema = (id_tema) => {
    if (!stompRef.current?.connected || !soyCreador || partida?.es_publica) return;
    setTemaSeleccionado(id_tema);
    stompRef.current.publish({
      destination: `/app/partida/${id_partida}/tema`,
      body: JSON.stringify({ id_tema: parseInt(id_tema) })
    });
  };

  // Cambiar tiempo (solo creador, solo privadas)
  const handleCambiarTiempo = (tiempo) => {
    if (!stompRef.current?.connected || !soyCreador || partida?.es_publica) return;
    setTiempoSeleccionado(tiempo);
    stompRef.current.publish({
      destination: `/app/partida/${id_partida}/tiempoTurno`,
      body: JSON.stringify({ tiempo_espera: parseInt(tiempo) })
    });
  };

  // Iniciar partida (RF-13: solo creador, con mínimo 2 por equipo)
  const handleIniciar = async () => {
    try {
      await fetch(`${API_BASE}/partida/${id_partida}/iniciar`, {
        method: "PUT",
        credentials: "include"
      });
      // El WS avisará del cambio de estado a en_curso
    } catch (err) {
      console.error("Error al iniciar:", err);
    }
  };

  // Copiar código de partida
  const handleCopiarCodigo = () => {
    if (!partida?.codigo_partida) return;
    navigator.clipboard.writeText(partida.codigo_partida).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  // Equipos dividir
  const equipoRojo = (partida?.jugadores || []).filter((j) => j.equipo === "rojo");
  const equipoAzul = (partida?.jugadores || []).filter((j) => j.equipo === "azul");
  const slotsRojo = [...equipoRojo, ...Array(Math.max(0, 4 - equipoRojo.length)).fill(null)];
  const slotsAzul = [...equipoAzul, ...Array(Math.max(0, 4 - equipoAzul.length)).fill(null)];


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c4a060] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-['Courier_Prime',monospace] text-[#8b2020]">{error}</p>
        <button onClick={() => navigate("/home")} className="font-['Courier_Prime',monospace] text-[#8a7a60]">
          ← Volver al Home
        </button>
      </div>
    );
  }

  return (
    <ScreenFrame title="ASIGNACIÓN DE EQUIPOS">
      <div className="max-w-4xl mx-auto pt-8 sm:pt-4">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-[#8a7a60] hover:text-[#d4b878] transition-colors cursor-pointer mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 11 }}>
            VOLVER AL ESCRITORIO
          </span>
        </button>

        <ManilaFolder>
          <div className="p-4 sm:p-6 lg:p-8">

            {/* Tab */}
            <div className="absolute -top-0 left-6 bg-[#b89055] px-4 py-1.5 rounded-b-sm border-x border-b border-[#a08040] shadow-sm z-10">
              <span className="font-['Courier_Prime',monospace] text-[#2a1a08]" style={{ fontSize: 9 }}>
                SALA DE ESPERA
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 mt-2">
              <SectionHeader title="ASIGNACIÓN DE EQUIPOS" />
              <div className="flex items-center gap-3">
                {/* Código de partida. Solo lo muestra si es privada. */}
                {partida?.codigo_partida && !partida?.es_publica && (
                  <button
                    onClick={handleCopiarCodigo}
                    className="bg-[#f5edd8] border-2 border-[#a08050]/40 rounded-sm px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-[#ede0c0] transition-colors"
                  >
                    <div>
                      <span className="font-['Courier_Prime',monospace] text-[#8a7a60] block" style={{ fontSize: 8 }}>CÓDIGO:</span>
                      <span className="font-['Courier_Prime',monospace] text-[#3a2a10] tracking-[0.15em]" style={{ fontSize: 14 }}>
                        {partida.codigo_partida}
                      </span>
                    </div>
                    <Copy className="w-4 h-4 text-[#8a7a60]" />
                    {copiado && (
                      <span className="text-[#50a050] text-xs">✓</span>
                    )}
                  </button>
                )}
                <FBISeal size={44} />
              </div>
            </div>

            {/* Info de selección */}
            <div className="bg-[#c4a060]/10 border border-[#c4a060]/30 rounded-sm px-4 py-2 mb-5">
              <p className="font-['Courier_Prime',monospace] text-[#403937]" style={{ fontSize: 11 }}>
                Haz clic en la cabecera del equipo para unirte. Tu equipo actual:{" "}
                <strong style={{ color: miEquipo === "rojo" ? "#e08080" : miEquipo === "azul" ? "#80a0d0" : "#d4b878" }}>
                  {miEquipo ? `EQUIPO ${miEquipo.toUpperCase()}` : "Sin asignar"}
                </strong>
              </p>
            </div>

            {/* Equipos */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 mb-6">

              {/* Equipo Rojo */}
              <DarkCard
                className={`p-4 sm:p-5 cursor-pointer transition-all ${miEquipo === "rojo" ? "ring-2 ring-[#cc3333]" : ""}`}
                onClick={() => handleCambiarEquipo("rojo")}
              >
                <div className="text-center mb-3 pb-2 border-b border-[#8b2020]/30">
                  <div className="w-4 h-4 bg-[#cc3333] rounded-full mx-auto mb-1.5 shadow-[0_0_8px_rgba(200,50,50,0.4)]" />
                  <h3 className="font-['Special_Elite',cursive] text-[#ff0000] tracking-[0.15em]" style={{ fontSize: 16 }}>
                    EQUIPO ROJO
                  </h3>
                  <span className="font-['Courier_Prime',monospace] text-[#888]" style={{ fontSize: 9 }}>
                    {equipoRojo.length} jugador{equipoRojo.length !== 1 ? "es" : ""}
                  </span>
                  {miEquipo === "rojo" && (
                    <div><span className="font-['Courier_Prime',monospace] text-[#50a050]" style={{ fontSize: 9 }}>✓ TU EQUIPO</span></div>
                  )}
                </div>
                <div className="space-y-2">
                  {slotsRojo.slice(0, 4).map((p, i) => (
                    <PlayerSlot key={i} player={p} teamColor="rojo" />
                  ))}
                </div>
              </DarkCard>

              {/* VS */}
              <div className="flex lg:flex-col items-center justify-center gap-2 py-2 lg:py-0">
                <div className="hidden lg:block w-px h-12 bg-[#8a7a60]/30" />
                <div className="w-12 h-12 rounded-full bg-[#f5edd8] border-2 border-[#a08050]/40 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="font-['Special_Elite',cursive] text-[#4a3a20]" style={{ fontSize: 14 }}>VS</span>
                </div>
                <div className="hidden lg:block w-px h-12 bg-[#8a7a60]/30" />
              </div>

              {/* Equipo Azul */}
              <DarkCard
                className={`p-4 sm:p-5 cursor-pointer transition-all ${miEquipo === "azul" ? "ring-2 ring-[#3366cc]" : ""}`}
                onClick={() => handleCambiarEquipo("azul")}
              >
                <div className="text-center mb-3 pb-2 border-b border-[#2a3a5a]/30">
                  <div className="w-4 h-4 bg-[#3366cc] rounded-full mx-auto mb-1.5 shadow-[0_0_8px_rgba(50,100,200,0.4)]" />
                  <h3 className="font-['Special_Elite',cursive] text-[#001958] tracking-[0.15em]" style={{ fontSize: 16 }}>
                    EQUIPO AZUL
                  </h3>
                  <span className="font-['Courier_Prime',monospace] text-[#888]" style={{ fontSize: 9 }}>
                    {equipoAzul.length} jugador{equipoAzul.length !== 1 ? "es" : ""}
                  </span>
                  {miEquipo === "azul" && (
                    <div><span className="font-['Courier_Prime',monospace] text-[#50a050]" style={{ fontSize: 9 }}>✓ TU EQUIPO</span></div>
                  )}
                </div>
                <div className="space-y-2">
                  {slotsAzul.slice(0, 4).map((p, i) => (
                    <PlayerSlot key={i} player={p} teamColor="azul" />
                  ))}
                </div>
              </DarkCard>
            </div>

            {/* Configuración */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#f5edd8] border border-[#a08050]/30 rounded-sm px-3 sm:px-4 py-2 flex flex-col justify-center">
                <span className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 9 }}>TIPO</span>
                <p className="font-['Courier_Prime',monospace] text-[#3a2a10]" style={{ fontSize: 12 }}>
                  {partida?.es_publica ? "Pública" : "Privada"}
                </p>
              </div>

              {/* Tiempo (editable si soy creador y es privada) */}
              <div className="bg-[#f5edd8] border border-[#a08050]/30 rounded-sm px-3 sm:px-4 py-2 flex flex-col justify-center">
                <label className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 9 }}>TURNO</label>
                {soyCreador && !partida?.es_publica ? (
                  <select
                    value={tiempoSeleccionado || "60"}
                    onChange={(e) => handleCambiarTiempo(e.target.value)}
                    className="font-['Courier_Prime',monospace] text-[#3a2a10] bg-transparent outline-none cursor-pointer p-0 m-0 w-full"
                    style={{ fontSize: 12 }}
                  >
                    <option value="30">30 segundos</option>
                    <option value="60">60 segundos</option>
                    <option value="90">90 segundos</option>
                    <option value="120">120 segundos</option>
                  </select>
                ) : (
                  <p className="font-['Courier_Prime',monospace] text-[#3a2a10]" style={{ fontSize: 12 }}>
                    {partida?.tiempo_espera}s
                  </p>
                )}
              </div>

              {/* Tema (editable si soy creador y es privada) */}
              <div className="bg-[#f5edd8] border border-[#a08050]/30 rounded-sm px-3 sm:px-4 py-2 flex flex-col justify-center">
                <label className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 9 }}>TEMA</label>
                {soyCreador && !partida?.es_publica ? (
                  <select
                    value={temaSeleccionado || ""}
                    onChange={(e) => handleCambiarTema(e.target.value)}
                    className="font-['Courier_Prime',monospace] text-[#3a2a10] bg-transparent outline-none cursor-pointer p-0 m-0 w-full"
                    style={{ fontSize: 12 }}
                  >
                    {temasDisponibles.map((t) => (
                      <option key={t.id_tema} value={t.id_tema}>{t.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-['Courier_Prime',monospace] text-[#3a2a10]" style={{ fontSize: 12 }}>
                    {partida?.nombre_tema || "—"}
                  </p>
                )}
              </div>
            </div>

            {/* Máximo jugadores */}
            <div className="bg-[#f5edd8] border border-[#a08050]/20 rounded-sm px-4 py-2 mb-4 flex items-center justify-between">
              <span className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 9 }}>
                PLAZAS: {(partida?.jugadores?.length || 0)}/{partida?.max_jugadores || "?"}
              </span>
              {partida?.hay_minimo ? (
                <span className="font-['Courier_Prime',monospace] text-[#50a050]" style={{ fontSize: 9 }}>
                  ✓ MÍNIMO ALCANZADO
                </span>
              ) : (
                <span className="font-['Courier_Prime',monospace] text-[#e08080]" style={{ fontSize: 9 }}>
                  MÍNIMO 2 JUGADORES POR EQUIPO
                </span>
              )}
            </div>

            {/* Botón iniciar (RF-13: solo creador, hay_minimo) */}
            {soyCreador && (
              <button
                onClick={handleIniciar}
                disabled={!partida?.hay_minimo}
                className={`w-full text-white py-4 rounded-sm shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-colors flex items-center justify-center gap-3 ${
                  partida?.hay_minimo
                    ? "bg-[#2a5a2a] hover:bg-[#3a6a3a] cursor-pointer"
                    : "bg-[#2a2a2a] cursor-not-allowed opacity-50"
                }`}
              >
                <Fingerprint className="w-5 h-5 text-[#80c090]" />
                <div className="flex items-center gap-2">
                  {partida?.hay_minimo && (
                    <div className="w-3 h-3 bg-[#50ff50] rounded-full animate-pulse shadow-[0_0_8px_rgba(80,255,80,0.5)]" />
                  )}
                  <span
                    className="font-['Special_Elite',cursive] tracking-[0.15em] sm:tracking-[0.2em]"
                    style={{ fontSize: "clamp(12px, 2vw, 16px)" }}
                  >
                    {partida?.hay_minimo ? "INICIAR PARTIDA" : "ESPERANDO JUGADORES..."}
                  </span>
                </div>
              </button>
            )}

            {!soyCreador && (
              <div className="text-center py-3">
                <p className="font-['Courier_Prime',monospace] text-[#888]" style={{ fontSize: 11 }}>
                  Esperando a que el creador inicie la partida...
                </p>
                <div className="flex justify-center mt-2 gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-[#c4a060] rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <RedStamp text="CONFIDENTIAL" className="rotate-[-3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}