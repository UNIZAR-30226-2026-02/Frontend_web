/*
 * Pantalla con el listado de partidas públicas que no han sido iniciadas todavía.
 */

import { ManilaFolder, DarkCard, RedStamp, FBISeal, SectionHeader, TapeStrip } from "../components/ScreenFrame";
import { Search, Users, Clock, ArrowLeft, Filter, Loader2 } from "lucide-react"; 
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

// Datos de prueba: TODO: integrar con backend utilizando useEffect.
/*const missions = [
  { id: 1, name: "Operación Medusa", host: "ProAgente99", players: "6/8", theme: "Cyberpunk", timer: "60s", time: "02:34", status: "ESPERANDO" },
  { id: 2, name: "Proyecto Cóndor", host: "EspíaMaestro", players: "4/8", theme: "Naturaleza", timer: "90s", time: "15:02", status: "ESPERANDO" },
  { id: 3, name: "Código Fenix", host: "CodigoSecreto", players: "3/6", theme: "Espacio", timer: "60s", time: "00:45", status: "ESPERANDO" },
  { id: 4, name: "Operación Trueno", host: "NightFox_99", players: "7/8", theme: "Cyberpunk", timer: "120s", time: "08:12", status: "ESPERANDO" },
  { id: 5, name: "Misión Fantasma", host: "SilentViper", players: "5/10", theme: "Fantasía", timer: "60s", time: "03:47", status: "ESPERANDO" },
  { id: 6, name: "Proyecto Sombra", host: "LoboÁrtico", players: "8/8", theme: "Naturaleza", timer: "90s", time: "20:15", status: "LLENA" },
  { id: 7, name: "Operación Delta", host: "PhantomX", players: "2/4", theme: "Espacio", timer: "30s", time: "01:10", status: "ESPERANDO" },
];*/

export function Pantalla03MisionesPublicas() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTheme, setFilterTheme] = useState(null); 

  // Estados para manejar los datos del servidor.
  const [missions, setMissions] = useState([]); // Empieza vacío
  const [isLoading, setIsLoading] = useState(true); // Empieza cargando
  const [error, setError] = useState(null); // Por si falla la red
  

  // Función que se ejecuta al cargar la pantalla para mostrar los datos contenidos en
  // la base de datos sobre las partidas públicas abiertas.
  useEffect(() => {
    // Definimos la función asíncrona
    const fetchMisiones = async () => {
      try {

        // URL del backend de donde recibir el listado de partidas.
        const response = await fetch("http://localhost:8080/api/partidas/publicas", {
          method: "GET",
          // Adjuntar la cookie HttpOnly con el JWT automáticamente para ser validado
          // por el backend (por el CORS).
          credentials: "include"
        });
        
        if (!response.ok) throw new Error("Acceso denegado a los servidores del FBI");
        
        const data = await response.json();

        // Adaptar los datos obtenidos de la base de datos para mostrarlos por pantalla
        // con el formato requerido.
        const misionesFormateadas = data.map(partida => {
          // Contamos cuántos jugadores hay en la lista 'jugadores' (si viene nula, son 0)
          const numJugadoresActuales = partida.jugadores ? partida.jugadores.length : 0;
          
          // Extraemos el anfitrión (asumiendo que es el primer jugador de la lista)
          const hostName = (partida.jugadores && partida.jugadores.length > 0) 
                            ? partida.jugadores[0].tag 
                            : "Agente Desconocido";

          return {
            id: partida.idPartida, // (camelCase)
            name: `Operación ${partida.codigoPartida}`,
            host: hostName, 
            players: `${numJugadoresActuales}/${partida.maxJugadores}`, 
            theme: partida.nombreTema || "Clásico", 
            // TODO: revisar si se pone el tiempo de espera o no.
            timer: "60s", // El DTO no tiene tiempoEspera, así que ponemos un valor fijo por ahora
            time: "00:00", 
            status: numJugadoresActuales >= partida.maxJugadores ? "LLENA" : "ESPERANDO" // O usar partida.estado
          };
        });

        setMissions(misionesFormateadas);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false); // Terminar de cargar, haya ido bien o mal
      }
    };

    // Ejecutamos la función
    fetchMisiones();
  }, []); // [] para que se ejecute solo una vez, al cargar la pantalla.
  

  const filtered = missions.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.host.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTheme = !filterTheme || m.theme === filterTheme;
    return matchSearch && matchTheme;
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
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Naturaleza">Naturaleza</option>
                  <option value="Espacio">Espacio</option>
                  <option value="Fantasía">Fantasía</option>
                </select>
              </div>
            </div>

{/*
            // Mision list (inicial, sin conexión con backend).
            <div className="space-y-2.5">
              {filtered.map((m) => {
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
                        <p className="font-['Courier_Prime',monospace] text-[#8a7a60] mt-0.5" style={{ fontSize: 9 }}>
                          Anfitrión: {m.host} — Tema: {m.theme} — Turno: {m.timer}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#5a4a30]" />
                        <span className="font-['Courier_Prime',monospace] text-[#5a4a30]" style={{ fontSize: 11 }}>{m.players}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-[#3a2a10]/10 rounded-sm px-2 py-1">
                        <Clock className="w-3 h-3 text-[#5a4a30]" />
                        <span className="font-['Courier_Prime',monospace] text-[#3a2a10]" style={{ fontSize: 11 }}>{m.time}</span>
                      </div>
                      
                      {isFull ? (
                        <div className="flex bg-[#5a2a2a]/20 border border-[#8a4a4a]/30 rounded-sm px-2 py-2 cursor-not-allowed">
                          <span className="font-['Courier_Prime',monospace] text-[#8b2020]" style={{ fontSize: 8 }}>LLENA</span>
                        </div>
                      ) : (
                        <div 
                          onClick={() => navigate("/lobby")}
                          className="flex bg-[#2a5a2a]/20 border border-[#4a8a4a]/30 rounded-sm px-2 py-2 cursor-pointer hover:bg-[#2a5a2a]/40 transition-colors"
                        >
                          <span className="font-['Courier_Prime',monospace] text-[#2a5a2a] hover:text-[#1a3a1a]" style={{ fontSize: 12 }}>UNIRSE</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-8">
                <p className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 12 }}>
                  No se encontraron misiones disponibles
                </p>
              </div>
            )}*/}

            {/* Mission list */}
            {isLoading ? (
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
                          <p className="font-['Courier_Prime',monospace] text-[#8a7a60] mt-0.5" style={{ fontSize: 9 }}>
                            Anfitrión: {m.host} — Tema: {m.theme} — Turno: {m.timer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#5a4a30]" />
                          <span className="font-['Courier_Prime',monospace] text-[#5a4a30]" style={{ fontSize: 11 }}>{m.players}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[#3a2a10]/10 rounded-sm px-2 py-1">
                          <Clock className="w-3 h-3 text-[#5a4a30]" />
                          <span className="font-['Courier_Prime',monospace] text-[#3a2a10]" style={{ fontSize: 11 }}>{m.time}</span>
                        </div>
                        {isFull ? (
                          <div className="bg-[#5a2a2a]/20 border border-[#8a4a4a]/30 rounded-sm px-2 py-0.5">
                            <span className="font-['Courier_Prime',monospace] text-[#8b2020]" style={{ fontSize: 8 }}>LLENA</span>
                          </div>
                        ) : (
                          <div 
                            onClick={() => navigate("/lobby")}  // TODO: poner endpoint real del backend.
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
                    <p className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 12 }}>
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