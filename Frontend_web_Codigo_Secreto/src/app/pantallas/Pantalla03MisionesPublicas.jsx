/*
 * Pantalla con el listado de partidas públicas que no han sido iniciadas todavía.
 */

import { ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader, TapeStrip } from "../components/ScreenFrame";
import { Search, Users, Clock, ArrowLeft, Filter, Loader2 } from "lucide-react"; 
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { usePartidasPublicas } from "../hooks/hooksPartidas";
import { obtenerPartidasPublicas, obtenerTemasJugador, unirsePartidaPublica } from "../api/apiPartidas";

// Datos de prueba sin conexión con backend.
/*const data = [
  { id_partida: 1, tagCreador: "ProAgente99", nombreTema: "Cyberpunk", tiempoEspera: 60, maxJugadores: 8, jugadoresActuales: 6 },
  { id_partida: 2, tagCreador: "EspíaMaestro", nombreTema: "Naturaleza", tiempoEspera: 90, maxJugadores: 8, jugadoresActuales: 4 },
  { id_partida: 3, tagCreador: "CodigoSecreto", nombreTema: "Espacio", tiempoEspera: 60, maxJugadores: 6, jugadoresActuales: 3 },
  { id_partida: 4, tagCreador: "NightFox_99", nombreTema: "Cyberpunk", tiempoEspera: 120, maxJugadores: 8, jugadoresActuales: 8 }
];*/

export function Pantalla03MisionesPublicas() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTheme, setFilterTheme] = useState(null); 

  // Estados para manejar los temas del jugador obtenidos vía API REST.
  const [misTemas, setMisTemas] = useState([]); 
  const [isLoadingTemas, setIsLoadingTemas] = useState(true);

  // Estados para manejar los datos del servidor.
  const [missions, setMissions] = useState([]); // Empieza vacío
  const [isLoading, setIsLoading] = useState(true); // Empieza cargando
  const [error, setError] = useState(null); // Por si falla la red
  
  // Solicitar al backend los temas del jugador al inicializar la pantalla.
  useEffect(() => {
    const fetchTemas = async () => {
      try {
        // Se llama a la función de 'apiPartidas.js' para pedir los temas al backend.
        const temas = await obtenerTemasJugador();
        setMisTemas(temas);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTemas(false);
      }
    };
    fetchTemas();
  }, []); // Se ejecuta solo una vez, al cargar la pantalla.

  // Solicitar al backend las partidas públicas para mostrarlas en el momento en el que se 
  // inicializa la pantalla.
  useEffect(() => {
    const fetchPartidas = async () => {
      try {
        // Se llama a la función de 'apiPartidas.js' para pedir las partidas al backend.
        const partidas = await obtenerPartidasPublicas();
        handleMisionesActualizadas(partidas);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPartidas();
  }, []); // Se ejecuta solo una vez, al cargar la pantalla.

  // Se define qué hacer cuando llegan datos nuevos. Se usa useCallback para
  // evitar que se desconecte el WebSocket al actualizar el estado.
  const handleMisionesActualizadas = useCallback((data) => {
    const misionesFormateadas = data.map(partida => ({
      id: partida.id_partida,
      name: `Partida de ${partida.tag}`,
      //host: partida.tag, 
      players: `${partida.jugadores_actuales}/${partida.max_jugadores}`, 
      theme: partida.nombre, 
      timer: `${partida.tiempo_espera}s`, 
      status: partida.jugadores_actuales >= partida.max_jugadores ? "LLENA" : "ESPERANDO"
    }));

    setMissions(misionesFormateadas);
    setIsLoading(false);
    setError(null);
  }, []);

  // Se define qué hacer si hay un error de conexión.
  const handleError = useCallback((mensajeError) => {
    setError(mensajeError);
    setIsLoading(false);
  }, []);

  // Se invoca a 'hooksPartidas.js' para realizar el useEffect y la comunicación
  // con el backend a través de WebSockets.
  usePartidasPublicas(handleMisionesActualizadas, handleError);
  
  // Función para manejar el evento de unirse a una partida
  const handleUnirse = async (idPartida) => {
    try {
      // Se llama a la función de 'apiPartidas.js' para notificar al backend.
      await unirsePartidaPublica(idPartida);
      // Si la API no lanza error, navegamos al lobby.
      navigate(`/lobby/${idPartida}`);
    } catch (err) {
      console.error(err);
      alert(err.message || "No se ha podido acceder a la misión");
    }
  };

  // Filtrado de misiones para la barra de búsqueda.
  const filtered = missions.filter(m => {
    // Comprobar que el jugador tiene el tema de la misión (porque el backend ha enviado 
    // todas las partidas sin filtrar).
    const poseeTema = misTemas.some(t => t.nombre === m.theme);

    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTheme = !filterTheme || m.theme === filterTheme;
    
    return poseeTema && matchSearch && matchTheme;
  });

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-12 pt-16 sm:pt-12">
      <div className="max-w-4xl mx-auto">
        {/* Back to desk */}
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-[#8a7a60] hover:text-[#d4b878] transition-colors cursor-pointer mb-4 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 11 }}>VOLVER AL ESCRITORIO</span>
        </button>

        <ManilaFolder showTab={false} showClip={true}>
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Folder tab interno (solo visible en esta pantalla) */}
            <div className="absolute -top-3 left-6 bg-[#b89055] px-4 py-1 rounded-t-md border border-[#a08040] shadow-sm">
              <span className="font-['Courier_Prime',monospace] text-[#3a2a10]" style={{ fontSize: 9 }}>MISIONES DISPONIBLES</span>
            </div>

            <div className="flex items-start justify-between mb-5 flex-wrap gap-3 mt-1">
              <SectionHeader title="MISIONES PÚBLICAS" />
              <FBISeal size={44} />
            </div>

            {/* Search bar */}
            <div className="flex gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a60]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o anfitrión..."
                  className="w-full bg-[#f5edd8] border-2 border-[#a08050]/40 rounded-sm pl-10 pr-4 py-2.5 font-['Courier_Prime',monospace] text-[#3a2a10] placeholder:text-[#a09070] outline-none"
                  style={{ fontSize: 12 }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#5a4a30]" />
                <select
                  value={filterTheme || ""}
                  onChange={(e) => setFilterTheme(e.target.value || null)}
                  className="px-3 py-2 font-['Courier_Prime',monospace] bg-[#d0dae5] text-[#4a450a] border-l border-black/5 hover:shadow-lg cursor-pointer transition-all outline-none"
                  style={{ fontSize: 12, transform: 'rotate(-2deg)', boxShadow: '5px 5px 10px rgba(0,0,0,0.3)' }}
                >
                  <option value="">Todos los temas</option>
                  
                  {/* Datos de prueba de los temas.
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Naturaleza">Naturaleza</option>
                  <option value="Espacio">Espacio</option>
                  <option value="Fantasía">Fantasía</option>
                  */}

                  {/* Opciones del desplegable dinámicas basadas en los temas que posee el jugador */}
                  {!isLoadingTemas && misTemas.map(tema => (
                    <option key={tema.id_tema} value={tema.nombre}>
                      {tema.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mission list */}
            {isLoading || isLoadingTemas ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#8a7a60] animate-spin mb-4" />
                <p className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 12 }}>
                  INTERCEPTANDO COMUNICACIONES...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-[#5a2a2a]/10 border border-[#8b2020]/30 rounded-sm">
                <p className="font-['Courier_Prime',monospace] text-[#8b2020]" style={{ fontSize: 12 }}>
                  ERROR DE CONEXIÓN: {error}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Mission list  (solo se muestra si no está cargando y no hay error) */}
                {filtered.map((m) => {  // Bucle que recorre uno a uno los componentes de 
                  const isFull = m.status === "LLENA";
                  return (
                    <div
                      key={m.id}
                      className={`bg-[#f0e4c8]/50 border border-[#c4a060]/25 rounded-sm p-3 sm:p-4 flex items-center justify-between transition-all ${
                      isFull ? "opacity-50" : "" // Grisácea si está llena.
                    }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#50a050] shadow-[0_0_5px_rgba(80,160,80,0.4)]" />
                        <div className="min-w-0 flex-1">
                          <p className="font-['Courier_Prime',monospace] text-[#3a2a10] truncate" style={{ fontSize: 13 }}>{m.name}</p>
                          <p className="font-['Courier_Prime',monospace] text-[#5C5446] mt-0.5" style={{ fontSize: 10 }}>
                            Tema: {m.theme} — Turno: {m.timer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#5a4a30]" />
                          <span className="font-['Courier_Prime',monospace] text-[#5a4a30]" style={{ fontSize: 11 }}>{m.players}</span>
                        </div>
                        {/* COMENTADO: Este dato de tiempo transcurrido (time) ya no se recibe en la API */}
                        {/* <div className="flex items-center gap-1 bg-[#3a2a10]/10 rounded-sm px-2 py-1">
                          <Clock className="w-3 h-3 text-[#5a4a30]" />
                          <span className="font-['Courier_Prime',monospace] text-[#3a2a10]" style={{ fontSize: 11 }}>{m.time}</span>
                        </div> 
                        */}
                        {isFull ? (
                          <div className="flex bg-[#5a2a2a]/20 border border-[#8a4a4a]/30 rounded-sm px-2 py-2">
                            <span className="font-['Courier_Prime',monospace] text-[#8b2020]" style={{ fontSize: 12 }}>LLENA</span>
                          </div>
                        ) : (
                          <div 
                            onClick={() => handleUnirse(m.id)}
                            className="flex bg-[#2a5a2a]/20 border border-[#4a8a4a]/30 rounded-sm px-2 py-2 cursor-pointer hover:bg-[#2a5a2a]/40 transition-colors"
                          >
                            <span className="font-['Courier_Prime',monospace] text-[#2a5a2a] hover:text-[#1a3a1a]" style={{ fontSize: 12 }}>UNIRSE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-8">
                    <p className="font-['Courier_Prime',monospace] text-[#423D36]" style={{ fontSize: 12 }}>
                      No se encontraron misiones disponibles.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between flex-wrap gap-2">
              <span className="font-['Courier_Prime',monospace] text-[#8a7a60]/50" style={{ fontSize: 8 }}>
                REF: FBI-MISSIONS-{filtered.length} RESULTADOS
              </span>
              <RedStamp text="CLASSIFIED" className="rotate-[-3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>
    </div>
  );
}