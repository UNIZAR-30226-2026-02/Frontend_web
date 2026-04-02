/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         mockServer.js — Código Secreto · Mock Completo           ║
 * ║                                                                  ║
 * ║  Simula el backend incluyendo:                          ║
 * ║  • Todos los endpoints REST (MSW)                                ║
 * ║  • WebSocket STOMP completo por partida                          ║
 * ║  • Estado compartido entre pestañas (BroadcastChannel)           ║
 * ║  • Flujo completo: crear→lobby→jugar (jefe y agente)             ║
 * ║  • Temporizadores, votaciones, pistas                            ║
 * ║  • Tienda, amigos, leaderboard, logros, historial, perfil        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Activación: solo en import.meta.env.DEV
 * Debugging:  window.__mock en la consola del navegador
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES DEL JUEGO (RF-14)
// ─────────────────────────────────────────────────────────────────────────────

const TIPOS_DIST = [
  "R","R","R","R","R","R","R","R",
  "B","B","B","B","B","B","B",
  "C","C","C","C",
  "A",
];

const PALABRAS_POOL = [
  "AGENTE","MISIÓN","SOMBRA","CÓDIGO","DELTA","AURORA","FÉNIX","KRAKEN",
  "CIPHER","ECLIPSE","ORIÓN","VÓRTEX","ATLAS","NEXUS","VECTOR","ZÉNIT",
  "CÓNDOR","MANTIS","COBRA","FALCÓN","HYDRA","LINCE","PUMA","TIGRE",
  "SIERRA","OMEGA","ALFA","BRAVO","TANGO","ZULÚ","OSCAR","LIMA",
  "NAVAJA","ESCUDO","LLAVE","MAPA","RADIO","BUNKER","RIFLE","DRONE",
  "CRÁTER","GLACIAR","DESIERTO","SELVA","OCÉANO","CIMA","CUEVA","FARO",
  "RELOJ","ESPEJO","ANCLA","BRÚJULA","PRISMÁTICO","RIFLE","FUNDA","CINTA",
  "DORADO","PLATA","BRONCE","COBRE","ACERO","TITANIO","CARBONO","PLASMA",
];

const IMAGENES_POOL = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=200&h=150&fit=crop",
];

// ─────────────────────────────────────────────────────────────────────────────
// GENERADORES DE DATOS
// ─────────────────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarTablero() {
  const tipos   = shuffle(TIPOS_DIST);
  const palabras = shuffle(PALABRAS_POOL).slice(0, 20);
  const imagenes = shuffle(IMAGENES_POOL);
  return Array.from({ length: 20 }, (_, i) => ({
    idCartaTablero: i + 1,
    palabra:        palabras[i],
    imagenUrl:      imagenes[i % imagenes.length],
    fila:           Math.floor(i / 5),
    columna:        i % 5,
    tipo:           tipos[i],
    estado:         "oculta",
  }));
}

function generarCodigo() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") +
    "-" +
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE DE DATOS EN MEMORIA (persistente entre pestañas por BroadcastChannel)
// ─────────────────────────────────────────────────────────────────────────────

// Catálogos
const CATALOGO_TEMAS = [
  { idTema: 1, nombre: "Magia",        descripcion: "Cartas con magia",   precioBalas: 350, activo: true },
  { idTema: 2, nombre: "Histórico",    descripcion: "Un poco de historia", precioBalas: 240, activo: true },
  { idTema: 3, nombre: "Vida submarina", descripcion: "Bajo el mar",      precioBalas: 500, activo: true },
  { idTema: 4, nombre: "Naturaleza",   descripcion: "Naturalmente bonito", precioBalas: 750, activo: true },
  { idTema: 5, nombre: "Cyberpunk",    descripcion: "Futuro distópico",  precioBalas: 450, activo: true },
];

const CATALOGO_PERSONALIZACIONES = [
  { idPersonalizacion: 1, nombre: "Marco Oro envejecido", tipo: "carta", valorVisual: "#d4af37", precioBalas: 100, activo: true },
  { idPersonalizacion: 2, nombre: "Marco Verde salvia",   tipo: "carta", valorVisual: "#8a9a5b", precioBalas: 100, activo: true },
  { idPersonalizacion: 3, nombre: "Marco Terracota cálida", tipo: "carta", valorVisual: "#c65d3b", precioBalas: 100, activo: true },
  { idPersonalizacion: 4, nombre: "Tablero Madera oscura", tipo: "tablero", valorVisual: "#2a2518", precioBalas: 150, activo: true },
  { idPersonalizacion: 5, nombre: "Tablero Piedra",       tipo: "tablero", valorVisual: "#4a4a4a", precioBalas: 150, activo: true },
  { idPersonalizacion: 6, nombre: "Tablero Púrpura real", tipo: "tablero", valorVisual: "#6a4a8a", precioBalas: 150, activo: true },
  { idPersonalizacion: 7, nombre: "Tablero Cuarzo rosa",  tipo: "tablero", valorVisual: "#d47a8a", precioBalas: 150, activo: true },
];

const LOGROS_CATALOGO = [
  { idLogro: 1, nombre: "Primera Misión", descripcion: "Completa tu primera partida", tipo: "logro", estadisticaClave: "partidasJugadas", valorObjetivo: 1, balasRecompensa: 50, activo: true },
  { idLogro: 2, nombre: "Victoria Inaugural", descripcion: "Gana tu primera partida", tipo: "logro", estadisticaClave: "victorias", valorObjetivo: 1, balasRecompensa: 100, activo: true },
  { idLogro: 3, nombre: "En Racha", descripcion: "Gana 5 partidas consecutivas", tipo: "logro", estadisticaClave: "racha", valorObjetivo: 5, balasRecompensa: 200, activo: true },
  { idLogro: 4, nombre: "Jefe Experto", descripcion: "Gana 10 partidas como Jefe", tipo: "logro", estadisticaClave: "victoriasComoLider", valorObjetivo: 10, balasRecompensa: 300, activo: true },
  { idLogro: 5, nombre: "Puntería Perfecta", descripcion: "Acierta 5 cartas en un turno", tipo: "logro", estadisticaClave: "aciertosEnTurno", valorObjetivo: 5, balasRecompensa: 150, activo: true },
  { idLogro: 6, nombre: "Defensa Sólida", descripcion: "Gana sin revelar civiles", tipo: "logro", estadisticaClave: "partidasSinCivil", valorObjetivo: 1, balasRecompensa: 250, activo: true },
  { idLogro: 7, nombre: "Líder de Escuadrón", descripcion: "Juega 50 partidas con amigos", tipo: "logro", estadisticaClave: "partidasConAmigos", valorObjetivo: 50, balasRecompensa: 500, activo: true },
  { idLogro: 8, nombre: "Centurión", descripcion: "Gana 100 partidas", tipo: "logro", estadisticaClave: "victorias", valorObjetivo: 100, balasRecompensa: 1000, activo: true },
  { idLogro: 9, nombre: "Agente de bronce", descripcion: "50 partidas ganadas", tipo: "medalla", estadisticaClave: "victorias", valorObjetivo: 50, balasRecompensa: 0, activo: true },
  { idLogro: 10, nombre: "Agente de plata", descripcion: "100 partidas ganadas", tipo: "medalla", estadisticaClave: "victorias", valorObjetivo: 100, balasRecompensa: 0, activo: true },
  { idLogro: 11, nombre: "Agente de oro", descripcion: "200 partidas ganadas", tipo: "medalla", estadisticaClave: "victorias", valorObjetivo: 200, balasRecompensa: 0, activo: true },
  { idLogro: 12, nombre: "Agente principiante", descripcion: "20 partidas jugadas", tipo: "logro", estadisticaClave: "partidasJugadas", valorObjetivo: 20, balasRecompensa: 50, activo: true },
  { idLogro: 13, nombre: "Agente de entrenamiento", descripcion: "50 partidas jugadas", tipo: "logro", estadisticaClave: "partidasJugadas", valorObjetivo: 50, balasRecompensa: 100, activo: true },
  { idLogro: 14, nombre: "Agente oficial", descripcion: "100 partidas jugadas", tipo: "logro", estadisticaClave: "partidasJugadas", valorObjetivo: 100, balasRecompensa: 200, activo: true },
  { idLogro: 15, nombre: "Agente inspector", descripcion: "200 partidas jugadas", tipo: "logro", estadisticaClave: "partidasJugadas", valorObjetivo: 200, balasRecompensa: 400, activo: true },
  { idLogro: 16, nombre: "Sociable", descripcion: "5 amigos añadidos", tipo: "logro", estadisticaClave: "amigos", valorObjetivo: 5, balasRecompensa: 50, activo: true },
  { idLogro: 17, nombre: "Puntería extrema", descripcion: "Acabar una partida sin fallos", tipo: "logro", estadisticaClave: "partidasSinFallos", valorObjetivo: 1, balasRecompensa: 150, activo: true },
  { idLogro: 18, nombre: "Fiebre de balas", descripcion: "Adquirir todos los paquetes", tipo: "logro", estadisticaClave: "temasCompletos", valorObjetivo: CATALOGO_TEMAS.filter(t => t.precioBalas > 0).length, balasRecompensa: 500, activo: true },
];

// Estado del jugador actual (puede modificarse con llamadas REST)
let jugadorActual = {
  idGoogle:      "mock_google_id",
  tag:           "AgenteTest",
  foto_perfil:    null,
  balas:         500,
  partidasJugadas: 12,
  victorias:     7,
  numAciertos:   43,
  numFallos:     11,
  derrotas:      5,
  porcentajeVictorias: 58.33,
  partidaActivaId: null,
  activo:        true,
  rachaActual:   3,           // para logro "En Racha"
};

// Inventarios
let inventarioTemas = [
  { idTema: 1 },  // Animales
  { idTema: 2 },  // Países
];
let inventarioPersonalizaciones = [
  { idPersonalizacion: 1, equipado: true },
  { idPersonalizacion: 4, equipado: true },
];
let personalizacionesEquipadas = {
  carta: 1,
  tablero: 4
};

// Progreso de logros
let progresoLogros = LOGROS_CATALOGO.map(logro => ({
  idLogro: logro.idLogro,
  progresoActual: 0,
  completado: false,
  fechaDesbloqueo: null,
}));
// Inicializar algunos completados
progresoLogros[0].progresoActual = 1; progresoLogros[0].completado = true; progresoLogros[0].fechaDesbloqueo = new Date().toISOString(); // Primera Misión
progresoLogros[1].progresoActual = 1; progresoLogros[1].completado = true; progresoLogros[1].fechaDesbloqueo = new Date().toISOString(); // Victoria Inaugural
progresoLogros[2].progresoActual = 3; // 3 de 5 para En Racha
progresoLogros[3].progresoActual = 5; // Jefe Experto (5/10)
progresoLogros[8].progresoActual = 7; // Agente de bronce (7/50)
progresoLogros[11].progresoActual = 12; // Agente principiante (12/20)

// Amigos
let amigos = [
  { idAmigo: "amigo1", tag: "LoboÁrtico", foto_perfil: null, victorias: 34, numAciertos: 78 },
  { idAmigo: "amigo2", tag: "NightFox_99", foto_perfil: null, victorias: 52, numAciertos: 112 },
];
let solicitudesPendientes = [
  { idSolicitante: "solicitante1", tagSolicitante: "PhantomX", foto_perfilSolicitante: null, fechaSolicitud: new Date().toISOString(), estado: "pendiente" },
];

// Historial de partidas (máx 30)
let historialPartidas = [
  { id_partida: 101, nombre_tema: "Animales", fechaFin: "2025-04-01T10:30:00", equipo_jugador: "rojo", rolJugador: "agente", victoria: true, numAciertos: 3, numFallos: 1 },
  { id_partida: 102, nombre_tema: "Países", fechaFin: "2025-04-02T15:45:00", equipo_jugador: "azul", rolJugador: "lider", victoria: false, numAciertos: 2, numFallos: 2 },
];

// Leaderboard global (simulado)
let rankingGlobal = [
  { tag: "ProAgente99", foto_perfil: null, victorias: 342, numAciertos: 1200 },
  { tag: "EspíaMaestro", foto_perfil: null, victorias: 298, numAciertos: 980 },
  { tag: "CodigoSecreto", foto_perfil: null, victorias: 276, numAciertos: 950 },
  { tag: "LoboÁrtico", foto_perfil: null, victorias: 34, numAciertos: 78 },
  { tag: "NightFox_99", foto_perfil: null, victorias: 52, numAciertos: 112 },
];

// Partidas en curso
const partidas = new Map();
let nextPartidaId = 1;
let nextJugadorId = 100;

// Mapa de clientes suscritos a topics (para broadcast STOMP)
const topicClients = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// MODELO DE PARTIDA (igual que antes, mejorado)
// ─────────────────────────────────────────────────────────────────────────────

function crearPartida({ idTema, es_publica, max_jugadores, tiempoEspera, creadorTag, creadorId }) {
  const id = nextPartidaId++;
  const tablero = generarTablero();
  const tiposReales = {};
  tablero.forEach(c => { tiposReales[c.idCartaTablero] = c.tipo; });

  const partida = {
    id_partida:        id,
    codigo_partida:    generarCodigo(),
    estado:           "esperando",
    es_publica,
    max_jugadores:     max_jugadores || 8,
    tiempoEspera:     tiempoEspera || 60,
    idTema,
    nombre_tema:       CATALOGO_TEMAS.find(t => t.idTema === idTema)?.nombre || "Animales",
    tag_creador:       creadorTag,
    jugadores:        [],
    tablero,
    tiposReales,
    turnoActual:      "rojo",
    fase_turno:        "esperando_pista",
    pistaActual:      null,
    votos:            {},
    turnoNum:         1,
    timer:            null,
    segundos:         tiempoEspera || 60,
    rachaAciertos:    0,
  };
  añadirJugador(partida, creadorTag, creadorId, "rojo");
  partidas.set(id, partida);
  return partida;
}

function añadirJugador(partida, tag, idGoogle, equipoPref) {
  const rojos = partida.jugadores.filter(j => j.equipo === "rojo").length;
  const azules = partida.jugadores.filter(j => j.equipo === "azul").length;
  const equipo = equipoPref || (rojos <= azules ? "rojo" : "azul");
  const jp = {
    idJugadorPartida: nextJugadorId++,
    idGoogle,
    tag,
    equipo,
    rol: "agente",
    foto_perfil: null,
    abandono: false,
    numAciertos: 0,
    numFallos: 0,
  };
  partida.jugadores.push(jp);
  return jp;
}

function calcularhay_minimo(partida) {
  const activos = partida.jugadores.filter(j => !j.abandono);
  const rojos  = activos.filter(j => j.equipo === "rojo").length;
  const azules = activos.filter(j => j.equipo === "azul").length;
  return rojos >= 2 && azules >= 2;
}

function asignarRoles(partida) {
  const rojos  = shuffle(partida.jugadores.filter(j => j.equipo === "rojo" && !j.abandono));
  const azules = shuffle(partida.jugadores.filter(j => j.equipo === "azul" && !j.abandono));
  rojos.forEach((j, i)  => { j.rol = i === 0 ? "lider" : "agente"; });
  azules.forEach((j, i) => { j.rol = i === 0 ? "lider" : "agente"; });
}

function lobbyDTO(partida) {
  return {
    id_partida:      partida.id_partida,
    codigo_partida:  partida.codigo_partida,
    estado:         partida.estado,
    es_publica:      partida.es_publica,
    max_jugadores:   partida.max_jugadores,
    tiempo_espera:   partida.tiempoEspera,
    id_tema:         partida.idTema,
    nombre_tema:     partida.nombre_tema,
    tag_creador:     partida.tag_creador,
    hay_minimo:      calcularhay_minimo(partida),
    jugadores:      partida.jugadores.filter(j => !j.abandono).map(j => ({
      tag: j.tag,
      foto_perfil: j.foto_perfil,
      equipo: j.equipo,
    })),
  };
}

function tableroParaJugador(partida, esLider) {
  return partida.tablero.map(c => ({
    ...c,
    tipo: (esLider || c.estado === "revelada") ? c.tipo : null,
  }));
}

function gameStateDTO(partida, esLider) {
  const activos = partida.jugadores.filter(j => !j.abandono);
  const votosArr = Object.entries(partida.votos).map(([id, tags]) => ({
    idCartaTablero: parseInt(id),
    votos: tags,
    total: tags.length,
  }));
  return {
    id_partida:              partida.id_partida,
    estado:                 partida.estado,
    equipo_turno_actual:      partida.turnoActual,
    fase_turno:              partida.fase_turno,
    cartas_rojas_restantes:   partida.tablero.filter(c => c.tipo === "R" && c.estado === "oculta").length,
    cartas_azules_restantes:  partida.tablero.filter(c => c.tipo === "B" && c.estado === "oculta").length,
    rojo_gana:               null,
    pistaActual:            partida.pistaActual,
    tablero:                { cartas: tableroParaJugador(partida, esLider) },
    votosTurnoActual:       votosArr,
    jugadores:              activos.map(j => ({ tag: j.tag, equipo: j.equipo, rol: j.rol })),
    totalAgentes:           activos.filter(j => j.equipo === partida.turnoActual && j.rol === "agente").length,
    segundosRestantes:      partida.segundos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BROADCAST ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function broadcast(topic, data) {
  const clients = topicClients.get(topic);
  if (!clients || clients.size === 0) return;
  const frame = { body: JSON.stringify(data) };
  clients.forEach(cb => {
    try { cb(frame); } catch (e) { console.error("[Mock broadcast]", e); }
  });
}

function broadcastGame(id_partida, suffix, data) {
  broadcast(`/topic/partidas/${id_partida}/${suffix}`, data);
}

function broadcastLobby(partida) {
  broadcastGame(partida.id_partida, "lobby", lobbyDTO(partida));
  broadcastPublicas();
}

function broadcastTablero(partida) {
  broadcastGame(partida.id_partida, "estado", gameStateDTO(partida, false));
  partida.jugadores
    .filter(j => j.rol === "lider" && !j.abandono)
    .forEach(j => {
      broadcast(`/user/${j.idGoogle}/queue/estado`, gameStateDTO(partida, true));
    });
}

function broadcastPublicas() {
  const publicas = [...partidas.values()]
    .filter(p => p.es_publica && p.estado === "esperando")
    .map(p => lobbyDTO(p));
  broadcast("/topic/partidas/publicas", publicas);
}

function broadcastNotificacion(idGoogle, tipo, payload) {
  broadcast(`/topic/usuarios/${idGoogle}/notificaciones`, { tipo, payload });
}

// ─────────────────────────────────────────────────────────────────────────────
// LÓGICA DE JUEGO (igual que antes, resumida)
// ─────────────────────────────────────────────────────────────────────────────

function iniciarTemporizador(partida) {
  detenerTemporizador(partida);
  partida.segundos = partida.tiempoEspera;
  partida.timer = setInterval(() => {
    partida.segundos--;
    broadcastGame(partida.id_partida, "temporizador", { segundosRestantes: partida.segundos });
    if (partida.segundos <= 0) {
      detenerTemporizador(partida);
      pasarTurno(partida, "tiempo_expirado");
    }
  }, 1000);
}

function detenerTemporizador(partida) {
  if (partida.timer) { clearInterval(partida.timer); partida.timer = null; }
}

function iniciarPartida(partida) {
  asignarRoles(partida);
  partida.estado       = "en_curso";
  partida.turnoActual  = "rojo";
  partida.fase_turno    = "esperando_pista";
  partida.pistaActual  = null;
  partida.votos        = {};
  partida.rachaAciertos = 0;
  broadcastLobby(partida);
  broadcastTablero(partida);
  iniciarTemporizador(partida);
}

function procesarPista(partida, palabraPista, pistaNumero, idGoogle) {
  const lider = partida.jugadores.find(j => j.idGoogle === idGoogle);
  if (!lider || lider.rol !== "lider" || lider.equipo !== partida.turnoActual) return;
  partida.pistaActual = { palabraPista: palabraPista.toUpperCase(), pistaNumero };
  partida.fase_turno   = "votando";
  partida.votos       = {};
  partida.rachaAciertos = 0;
  iniciarTemporizador(partida);
  broadcastGame(partida.id_partida, "pista", partida.pistaActual);
  broadcastTablero(partida);
}

function procesarVoto(partida, idCarta, idGoogle) {
  if (partida.estado !== "en_curso" || partida.fase_turno !== "votando") return;
  const agente = partida.jugadores.find(j => j.idGoogle === idGoogle);
  if (!agente || agente.rol !== "agente" || agente.equipo !== partida.turnoActual) return;
  Object.keys(partida.votos).forEach(id => {
    partida.votos[id] = partida.votos[id].filter(t => t !== agente.tag);
    if (partida.votos[id].length === 0) delete partida.votos[id];
  });
  if (!partida.votos[idCarta]) partida.votos[idCarta] = [];
  partida.votos[idCarta].push(agente.tag);
  const totalAgentes = partida.jugadores.filter(j => j.equipo === partida.turnoActual && j.rol === "agente" && !j.abandono).length;
  broadcastGame(partida.id_partida, "votos", {
    votosActuales: Object.entries(partida.votos).map(([id, tags]) => ({ idCartaTablero: parseInt(id), votos: tags, total: tags.length })),
    totalAgentes,
  });
  const mitad = Math.floor(totalAgentes / 2) + 1;
  for (const [idCartaStr, tags] of Object.entries(partida.votos)) {
    if (tags.length >= mitad) {
      const idCartaNum = parseInt(idCartaStr);
      revelarCarta(partida, idCartaNum);
      break;
    }
  }
}

function revelarCarta(partida, idCarta) {
  const carta = partida.tablero.find(c => c.idCartaTablero === idCarta);
  if (!carta || carta.estado === "revelada") return;
  carta.estado = "revelada";
  partida.votos = {};
  broadcastTablero(partida);
  const tipo = partida.tiposReales[idCarta];
  if (tipo === "A") {
    const ganador = partida.turnoActual === "rojo" ? "azul" : "rojo";
    setTimeout(() => finalizarPartida(partida, ganador, "asesino_revelado"), 1000);
    return;
  }
  const rojasOcultas  = partida.tablero.filter(c => c.tipo === "R" && c.estado === "oculta").length;
  const azulesOcultas = partida.tablero.filter(c => c.tipo === "B" && c.estado === "oculta").length;
  if (rojasOcultas === 0) { setTimeout(() => finalizarPartida(partida, "rojo", "agentes_descubiertos"), 1000); return; }
  if (azulesOcultas === 0) { setTimeout(() => finalizarPartida(partida, "azul", "agentes_descubiertos"), 1000); return; }
  const equipoActual = partida.turnoActual;
  const esPropia = tipo === equipoActual[0].toUpperCase();
  if (esPropia) {
    partida.rachaAciertos++;
    if (partida.rachaAciertos < partida.pistaActual.pistaNumero) {
      iniciarTemporizador(partida);
    } else {
      pasarTurno(partida, "limite_pista");
    }
  } else {
    pasarTurno(partida, "carta_incorrecta");
  }
}

function pasarTurno(partida, motivo) {
  partida.turnoActual = partida.turnoActual === "rojo" ? "azul" : "rojo";
  partida.fase_turno   = "esperando_pista";
  partida.pistaActual = null;
  partida.votos       = {};
  partida.turnoNum++;
  broadcastGame(partida.id_partida, "turno_cambiado", { turnoActual: partida.turnoActual, motivo });
  broadcastTablero(partida);
  iniciarTemporizador(partida);
}

function finalizarPartida(partida, ganador, motivo) {
  detenerTemporizador(partida);
  partida.estado = "finalizada";
  // Actualizar estadísticas de los jugadores
  const equipoGanador = ganador;
  for (const jp of partida.jugadores) {
    if (jp.abandono) continue;
    const victoria = jp.equipo === equipoGanador;
    // Actualizar contadores del jugador global
    const jugador = (jp.idGoogle === jugadorActual.idGoogle) ? jugadorActual : null; // simplificado: solo el jugador actual
    if (jugador) {
      jugador.partidasJugadas++;
      if (victoria) jugador.victorias++;
      jugador.numAciertos += jp.numAciertos;
      jugador.numFallos += jp.numFallos;
      jugador.derrotas = jugador.partidasJugadas - jugador.victorias;
      jugador.porcentajeVictorias = (jugador.victorias / jugador.partidasJugadas) * 100;
      // Recompensa de balas (RF-9)
      jugador.balas += victoria ? 20 : 10;
      // Añadir al historial
      historialPartidas.unshift({
        id_partida: partida.id_partida,
        nombre_tema: partida.nombre_tema,
        fechaFin: new Date().toISOString(),
        equipo_jugador: jp.equipo,
        rolJugador: jp.rol,
        victoria,
        numAciertos: jp.numAciertos,
        numFallos: jp.numFallos,
      });
      if (historialPartidas.length > 30) historialPartidas.pop();
      // Actualizar logros (simplificado)
      actualizarLogros(jugador, partida, jp);
    }
  }
  broadcastGame(partida.id_partida, "fin", { ganador, motivo });
  broadcastPublicas();
}

function actualizarLogros(jugador, partida, jp) {
  // Implementación simplificada: recorrer logros y actualizar progreso
  for (let logro of progresoLogros) {
    const info = LOGROS_CATALOGO.find(l => l.idLogro === logro.idLogro);
    if (!info || logro.completado) continue;
    let valorActual = 0;
    switch (info.estadisticaClave) {
      case "partidasJugadas": valorActual = jugador.partidasJugadas; break;
      case "victorias": valorActual = jugador.victorias; break;
      case "racha": valorActual = jugador.rachaActual; break;
      case "victoriasComoLider": valorActual = jp.rol === "lider" && jp.equipo === (partida.rojo_gana ? "rojo" : "azul") ? 1 : 0; break;
      case "aciertosEnTurno": valorActual = jp.numAciertos; break;
      case "partidasSinCivil": valorActual = 0; break; // placeholder
      case "partidasConAmigos": valorActual = 0; break;
      case "amigos": valorActual = amigos.length; break;
      case "temasCompletos": valorActual = inventarioTemas.length; break;
      default: continue;
    }
    if (valorActual >= info.valorObjetivo && !logro.completado) {
      logro.completado = true;
      logro.fechaDesbloqueo = new Date().toISOString();
      jugador.balas += info.balasRecompensa;
      // Notificar (RF-5)
      broadcastNotificacion(jugador.idGoogle, "logro_desbloqueado", { idLogro: logro.idLogro, nombre: info.nombre });
    } else {
      logro.progresoActual = Math.min(valorActual, info.valorObjetivo);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK STOMP CLIENT (igual que antes)
// ─────────────────────────────────────────────────────────────────────────────

export class MockStompClient {
  constructor(config = {}) {
    this.config         = config;
    this.connected      = false;
    this._subs          = new Map();
    this._timers        = [];
    this._id_partida     = null;
    this._idGoogle      = config.connectHeaders?.idGoogle || sessionStorage.getItem("mock_id_google") || jugadorActual.idGoogle;
    this._tag           = sessionStorage.getItem("mock_tag") || jugadorActual.tag;
  }

  activate() {
    const t = setTimeout(() => {
      this.connected = true;
      console.log(`[MockSTOMP] ✅ Conectado (${this._tag})`);
      if (this.config.onConnect) this.config.onConnect({ headers: {} });
    }, 80);
    this._timers.push(t);
  }

  deactivate() {
    this.connected = false;
    this._timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    this._timers = [];
    this._subs.forEach((cb, topic) => unregisterSubscription(topic, cb));
    this._subs.clear();
    console.log(`[MockSTOMP] 🔌 Desconectado (${this._tag})`);
  }

  subscribe(topic, callback) {
    const resolvedTopic = topic.replace("/user/queue/", `/user/${this._idGoogle}/queue/`);
    if (!this._subs.has(resolvedTopic)) {
      this._subs.set(resolvedTopic, callback);
      registerSubscription(resolvedTopic, callback);
    }
    const m = topic.match(/\/partidas\/(\d+)/);
    if (m && !this._id_partida) this._id_partida = parseInt(m[1]);
    console.log(`[MockSTOMP] 📡 ${this._tag} suscrito a ${resolvedTopic}`);
    return { id: `sub-${Math.random().toString(36).slice(2)}`, unsubscribe: () => {
      unregisterSubscription(resolvedTopic, callback);
      this._subs.delete(resolvedTopic);
    }};
  }

  publish({ destination, body }) {
    if (!destination) return;
    const payload = body ? (() => { try { return JSON.parse(body); } catch { return {}; } })() : {};
    console.log(`[MockSTOMP] 📤 ${this._tag} → ${destination}`, payload);
    const id = this._id_partida;
    const partida = id ? partidas.get(id) : null;
    if (!partida && !destination.includes("/lobby")) {
      if (destination.match(/\/partidas?\/\d+/)) console.warn("[MockSTOMP] Partida no encontrada para", destination);
    }
    this._route(destination, payload, partida);
  }

  _route(dest, payload, partida) {
    if (dest.includes("/votar") && partida) {
      const { idCartaTablero } = payload;
      if (partida.estado !== "en_curso") return;
      if (partida.fase_turno !== "votando") return;
      const jp = partida.jugadores.find(j => j.idGoogle === this._idGoogle);
      if (!jp || jp.equipo !== partida.turnoActual || jp.rol !== "agente") return;
      procesarVoto(partida, idCartaTablero, this._idGoogle);
    }
    else if (dest.includes("/pista") && partida) {
      if (partida.estado !== "en_curso") return;
      if (partida.fase_turno !== "esperando_pista") return;
      const jp = partida.jugadores.find(j => j.idGoogle === this._idGoogle);
      if (!jp || jp.rol !== "lider" || jp.equipo !== partida.turnoActual) return;
      procesarPista(partida, payload.palabraPista, payload.pistaNumero, this._idGoogle);
    }
    else if (dest.includes("/chat") && partida) {
      const jp = partida.jugadores.find(j => j.idGoogle === this._idGoogle);
      const equipo = jp?.equipo || "rojo";
      this._t(120, () => {
        broadcastGame(partida.id_partida, `chat/${equipo}`, {
          idMensaje: Date.now(),
          id_partida: partida.id_partida,
          idJugador: this._idGoogle,
          idGoogle: this._idGoogle,
          tag: this._tag,
          equipo,
          mensaje: payload.mensaje,
          fecha: new Date().toISOString(),
          esValido: true,
        });
      });
    }
    else if (dest.includes("/participantes/equipo") && partida) {
      const jp = partida.jugadores.find(j => j.idGoogle === this._idGoogle);
      if (!jp || partida.estado !== "esperando") return;
      const equipoNuevo = payload.equipo;
      const maxPorEquipo = Math.floor(partida.max_jugadores / 2);
      const enEquipo = partida.jugadores.filter(j => j.equipo === equipoNuevo && !j.abandono).length;
      if (enEquipo >= maxPorEquipo) return;
      jp.equipo = equipoNuevo;
      this._t(150, () => broadcastLobby(partida));
    }
    else if (dest.includes("/tema") && partida) {
      if (this._tag !== partida.tag_creador) return;
      const tema = CATALOGO_TEMAS.find(t => t.idTema === parseInt(payload.idTema));
      if (!tema) return;
      partida.idTema = tema.idTema;
      partida.nombre_tema = tema.nombre;
      this._t(150, () => broadcastLobby(partida));
    }
    else if (dest.includes("/tiempoTurno") && partida) {
      if (this._tag !== partida.tag_creador) return;
      const t = parseInt(payload.tiempoEspera);
      if ([30, 60, 90, 120].includes(t)) {
        partida.tiempoEspera = t;
        this._t(150, () => broadcastLobby(partida));
      }
    }
    else if (dest.includes("/abandonarLobby") && partida) {
      if (this._tag === partida.tag_creador) {
        partida.estado = "finalizada";
        detenerTemporizador(partida);
        this._t(150, () => { broadcastLobby(partida); broadcastPublicas(); });
      } else {
        const jp = partida.jugadores.find(j => j.idGoogle === this._idGoogle);
        if (jp) jp.abandono = true;
        this._t(150, () => broadcastLobby(partida));
      }
    }
  }

  _t(ms, fn) {
    const t = setTimeout(fn, ms);
    this._timers.push(t);
    return t;
  }

  simularDesconexion(segundoHastaReconexion = 3) {
    this.connected = false;
    if (this.config.onWebSocketClose) this.config.onWebSocketClose({});
    if (this.config.onStompError) this.config.onStompError({ headers: { message: "Simulated drop" } });
    console.warn(`[MockSTOMP] ⚡ ${this._tag} — desconectado. Reconectando en ${segundoHastaReconexion}s…`);
    this._t(segundoHastaReconexion * 1000, () => {
      this.connected = true;
      if (this.config.onConnect) this.config.onConnect({ headers: {} });
      console.log(`[MockSTOMP] 🔄 ${this._tag} — reconectado`);
      if (this._id_partida) {
        const p = partidas.get(this._id_partida);
        if (p) broadcastTablero(p);
      }
    });
  }
}

function registerSubscription(topic, callback) {
  if (!topicClients.has(topic)) topicClients.set(topic, new Set());
  topicClients.get(topic).add(callback);
}
function unregisterSubscription(topic, callback) {
  const set = topicClients.get(topic);
  if (set) set.delete(callback);
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLERS REST (MSW) — construidos para una base URL
// ─────────────────────────────────────────────────────────────────────────────

function buildHandlers(http, HttpResponse, base) {
  const u = p => `${base}${p}`;
  const ok = data => HttpResponse.json(data);
  const noContent = () => new HttpResponse(null, { status: 204 });
  const created = data => HttpResponse.json(data, { status: 201 });
  const notFound = msg => HttpResponse.json({ error: msg || "Not found" }, { status: 404 });
  const badRequest = msg => HttpResponse.json({ error: msg }, { status: 400 });
  const forbidden = msg => HttpResponse.json({ error: msg }, { status: 403 });

  return [
    // ──────────────────────────────────────────────────────────────
    // AUTH
    // ──────────────────────────────────────────────────────────────
    http.post(u("/api/auth/login"), () => ok({
      esNuevo: false,
      jwt: "mock_jwt_token_desarrollo",
      jugador: jugadorActual,
    })),
    http.post(u("/api/auth/registro"), async ({ request }) => {
      const body = await request.json().catch(() => ({}));
      jugadorActual.tag = body.tag;
      jugadorActual.idGoogle = body.idGoogle;
      jugadorActual.balas = 0;
      jugadorActual.partidasJugadas = 0;
      jugadorActual.victorias = 0;
      return ok({ jwt: "mock_jwt_token_desarrollo", jugador: jugadorActual });
    }),
    http.post(u("/api/auth/logout"), () => noContent()),
    http.put(u("/api/auth/desactivar"), () => { jugadorActual.activo = false; return noContent(); }),

    // ──────────────────────────────────────────────────────────────
    // JUGADOR
    // ──────────────────────────────────────────────────────────────
    http.get(u("/api/jugadores"), () => ok(jugadorActual)),
    http.put(u("/api/jugadores"), async ({ request }) => {
      const body = await request.json().catch(() => ({}));
      if (body.tag && body.tag !== jugadorActual.tag) {
        // Simular unicidad
        if (amigos.some(a => a.tag === body.tag) || rankingGlobal.some(r => r.tag === body.tag)) {
          return badRequest("Tag ya en uso");
        }
        jugadorActual.tag = body.tag;
      }
      if (body.foto_perfil) jugadorActual.foto_perfil = body.foto_perfil;
      return ok(jugadorActual);
    }),
    http.get(u("/api/jugadores/temas"), () => ok(inventarioTemas.map(it => CATALOGO_TEMAS.find(t => t.idTema === it.idTema)))),
    http.get(u("/api/jugadores/personalizaciones"), () => ok(inventarioPersonalizaciones.map(ip => ({
      ...CATALOGO_PERSONALIZACIONES.find(p => p.idPersonalizacion === ip.idPersonalizacion),
      equipado: ip.equipado,
    })))),
    http.get(u("/api/jugadores/historial"), () => ok({ partidas: historialPartidas.slice(0, 30), paginaActual: 0, totalPaginas: 1, totalPartidas: historialPartidas.length })),
    http.get(u("/api/jugadores/logros"), () => ok(progresoLogros.map(pl => {
      const base = LOGROS_CATALOGO.find(l => l.idLogro === pl.idLogro);
      return { ...base, progresoActual: pl.progresoActual, completado: pl.completado, fechaDesbloqueo: pl.fechaDesbloqueo };
    }))),

    // ──────────────────────────────────────────────────────────────
    // TIENDA
    // ──────────────────────────────────────────────────────────────
    http.get(u("/api/temas/activos"), () => ok(CATALOGO_TEMAS.filter(t => t.activo))),
    http.post(u("/api/tienda/comprar"), async ({ request }) => {
      const { idTema, idPersonalizacion } = await request.json();
      if (idTema) {
        const tema = CATALOGO_TEMAS.find(t => t.idTema === idTema);
        if (!tema) return badRequest("Tema no existe");
        if (jugadorActual.balas < tema.precioBalas) return badRequest("Balas insuficientes");
        if (inventarioTemas.some(t => t.idTema === idTema)) return badRequest("Ya posees este tema");
        jugadorActual.balas -= tema.precioBalas;
        inventarioTemas.push({ idTema });
        return ok({ balas: jugadorActual.balas });
      }
      if (idPersonalizacion) {
        const pers = CATALOGO_PERSONALIZACIONES.find(p => p.idPersonalizacion === idPersonalizacion);
        if (!pers) return badRequest("Personalización no existe");
        if (jugadorActual.balas < pers.precioBalas) return badRequest("Balas insuficientes");
        if (inventarioPersonalizaciones.some(ip => ip.idPersonalizacion === idPersonalizacion)) return badRequest("Ya posees este ítem");
        jugadorActual.balas -= pers.precioBalas;
        inventarioPersonalizaciones.push({ idPersonalizacion, equipado: false });
        return ok({ balas: jugadorActual.balas });
      }
      return badRequest("Debe especificar idTema o idPersonalizacion");
    }),
    http.put(u("/api/personalizaciones/equipar"), async ({ request }) => {
      const { idPersonalizacion, equipado } = await request.json();
      const pers = inventarioPersonalizaciones.find(ip => ip.idPersonalizacion === idPersonalizacion);
      if (!pers) return badRequest("No posees esta personalización");
      const tipo = CATALOGO_PERSONALIZACIONES.find(p => p.idPersonalizacion === idPersonalizacion)?.tipo;
      if (!tipo) return badRequest("Tipo desconocido");
      if (equipado) {
        // Desequipar el anterior del mismo tipo
        inventarioPersonalizaciones.forEach(ip => {
          const p = CATALOGO_PERSONALIZACIONES.find(pp => pp.idPersonalizacion === ip.idPersonalizacion);
          if (p && p.tipo === tipo && ip.equipado) ip.equipado = false;
        });
        pers.equipado = true;
        personalizacionesEquipadas[tipo] = idPersonalizacion;
      } else {
        pers.equipado = false;
        if (personalizacionesEquipadas[tipo] === idPersonalizacion) delete personalizacionesEquipadas[tipo];
      }
      return ok({ idPersonalizacion, equipado: pers.equipado });
    }),

    // ──────────────────────────────────────────────────────────────
    // SOCIAL (AMIGOS)
    // ──────────────────────────────────────────────────────────────
    http.get(u("/api/amigos"), () => ok(amigos)),
    http.get(u("/api/amigos/solicitudes"), () => ok(solicitudesPendientes)),
    http.post(u("/api/amigos/solicitudes"), async ({ request }) => {
      const { idReceptor } = await request.json();
      // Simular que existe el receptor
      const receptor = { idReceptor, tag: "Destinatario" };
      const nueva = {
        idSolicitante: jugadorActual.idGoogle,
        tagSolicitante: jugadorActual.tag,
        foto_perfilSolicitante: jugadorActual.foto_perfil,
        idReceptor,
        tagReceptor: receptor.tag,
        fotoReceptor: receptor.foto_perfil,
        estado: "pendiente",
        fechaSolicitud: new Date().toISOString(),
      };
      solicitudesPendientes.push(nueva);
      broadcastNotificacion(idReceptor, "solicitud_amistad", { solicitante: jugadorActual.tag });
      return ok(nueva);
    }),
    http.put(u("/api/amigos/solicitudes"), async ({ request }) => {
      const { idSolicitante, estado } = await request.json();
      const idx = solicitudesPendientes.findIndex(s => s.idSolicitante === idSolicitante);
      if (idx === -1) return notFound("Solicitud no encontrada");
      const solicitud = solicitudesPendientes[idx];
      if (estado === "aceptada") {
        amigos.push({
          idAmigo: solicitud.idSolicitante,
          tag: solicitud.tagSolicitante,
          foto_perfil: solicitud.foto_perfilSolicitante,
          victorias: Math.floor(Math.random() * 100),
          numAciertos: Math.floor(Math.random() * 200),
        });
      }
      solicitudesPendientes.splice(idx, 1);
      return ok({ ...solicitud, estado });
    }),
    http.delete(u("/api/amigos/:id"), ({ params }) => {
      const id = params.id;
      const idx = amigos.findIndex(a => a.idAmigo === id);
      if (idx !== -1) amigos.splice(idx, 1);
      return noContent();
    }),
    http.get(u("/api/jugadores/buscar"), ({ request }) => {
      const url = new URL(request.url);
      const tag = url.searchParams.get("tag") || "";
      const resultados = rankingGlobal.filter(r => r.tag.toLowerCase().includes(tag.toLowerCase()));
      return ok(resultados.map(r => ({ idGoogle: r.tag, tag: r.tag, foto_perfil: r.foto_perfil })));
    }),
    http.get(u("/api/leaderboard/global"), () => ok(rankingGlobal.slice(0, 10).map(r => ({ tag: r.tag, foto_perfil: r.foto_perfil, victorias: r.victorias, numAciertos: r.numAciertos })))),
    http.get(u("/api/leaderboard/amigos"), () => ok(amigos.map(a => ({ tag: a.tag, foto_perfil: a.foto_perfil, victorias: a.victorias, numAciertos: a.numAciertos })).sort((a,b) => b.victorias - a.victorias).slice(0,10))),

    // ──────────────────────────────────────────────────────────────
    // PARTIDAS (REST)
    // ──────────────────────────────────────────────────────────────
    http.get(u("/api/partidas/publicas"), () => {
      const publicas = [...partidas.values()].filter(p => p.es_publica && p.estado === "esperando");
      return ok(publicas.map(p => lobbyDTO(p)));
    }),
    http.post(u("/api/partidas"), async ({ request }) => {
      const body = await request.json().catch(() => ({}));
      const partida = crearPartida({
        idTema: body.idTema || 1,
        es_publica: body.es_publica ?? false,
        max_jugadores: body.max_jugadores || 8,
        tiempoEspera: body.tiempoEspera || 60,
        creadorTag: jugadorActual.tag,
        creadorId: jugadorActual.idGoogle,
      });
      if (partida.es_publica) broadcastPublicas();
      return created(lobbyDTO(partida));
    }),
    http.post(u("/api/partidas/:id/unirse/publica"), ({ params }) => {
      const partida = partidas.get(parseInt(params.id));
      if (!partida) return notFound();
      if (partida.estado !== "esperando") return badRequest("Partida ya comenzó");
      if (!partida.es_publica) return badRequest("No es pública");
      if (partida.jugadores.some(j => j.idGoogle === jugadorActual.idGoogle)) return badRequest("Ya estás en la partida");
      if (partida.jugadores.length >= partida.max_jugadores) return badRequest("Partida llena");
      añadirJugador(partida, jugadorActual.tag, jugadorActual.idGoogle);
      broadcastLobby(partida);
      return noContent();
    }),
    http.post(u("/api/partidas/:id/unirse/privada"), async ({ params, request }) => {
      const body = await request.json();
      const partida = partidas.get(parseInt(params.id));
      if (!partida) return notFound();
      if (partida.estado !== "esperando") return badRequest("Partida ya comenzó");
      if (partida.es_publica) return badRequest("No es privada");
      if (partida.codigo_partida !== body.codigo_partida) return badRequest("Código incorrecto");
      if (partida.jugadores.some(j => j.idGoogle === jugadorActual.idGoogle)) return badRequest("Ya estás en la partida");
      if (partida.jugadores.length >= partida.max_jugadores) return badRequest("Partida llena");
      añadirJugador(partida, jugadorActual.tag, jugadorActual.idGoogle);
      broadcastLobby(partida);
      return noContent();
    }),
    http.post(u("/api/partidas/join"), async ({ request }) => {
      const { codigo_partida } = await request.json();
      const partida = [...partidas.values()].find(p => p.codigo_partida === codigo_partida);
      if (!partida) return badRequest("Código no válido");
      if (partida.estado !== "esperando") return badRequest("Partida ya comenzó");
      if (partida.jugadores.some(j => j.idGoogle === jugadorActual.idGoogle)) return badRequest("Ya estás en la partida");
      if (partida.jugadores.length >= partida.max_jugadores) return badRequest("Partida llena");
      añadirJugador(partida, jugadorActual.tag, jugadorActual.idGoogle);
      broadcastLobby(partida);
      return ok({ id_partida: partida.id_partida, codigo_partida: partida.codigo_partida });
    }),
    http.get(u("/api/partidas/:id/lobby"), ({ params }) => {
      const partida = partidas.get(parseInt(params.id));
      if (!partida) return notFound();
      return ok(lobbyDTO(partida));
    }),
    http.put(u("/api/partida/:id/iniciar"), ({ params }) => {
      const partida = partidas.get(parseInt(params.id));
      if (!partida) return notFound();
      if (partida.estado !== "esperando") return badRequest("Partida ya iniciada");
      if (!calcularhay_minimo(partida)) return badRequest("Faltan jugadores (mínimo 2 por equipo)");
      iniciarPartida(partida);
      return noContent();
    }),
    http.get(u("/api/partida/:id/participantes/rol"), ({ params }) => {
      const partida = partidas.get(parseInt(params.id));
      if (!partida) return notFound();
      const jp = partida.jugadores.find(j => j.idGoogle === jugadorActual.idGoogle);
      if (!jp) return notFound("No perteneces a la partida");
      const cartasRojo = partida.tablero.filter(c => c.tipo === "R" && c.estado === "oculta").length;
      const cartasAzul = partida.tablero.filter(c => c.tipo === "B" && c.estado === "oculta").length;
      const equipoInicial = cartasRojo >= cartasAzul ? "rojo" : "azul";
      return ok({ rol: jp.rol, equipo: jp.equipo, equipoInicial });
    }),
    http.get(u("/api/partidas/:id/estado"), ({ params }) => {
      const partida = partidas.get(parseInt(params.id));
      if (!partida) return notFound();
      const jp = partida.jugadores.find(j => j.idGoogle === jugadorActual.idGoogle);
      const esLider = jp?.rol === "lider";
      return ok(gameStateDTO(partida, esLider));
    }),
    http.delete(u("/api/partidas/:id/participantes"), ({ params }) => {
      const partida = partidas.get(parseInt(params.id));
      if (!partida) return noContent();
      const jp = partida.jugadores.find(j => j.idGoogle === jugadorActual.idGoogle);
      if (jp) {
        if (partida.estado === "en_curso") {
          jugadorActual.balas = Math.max(0, jugadorActual.balas - 5);
          jp.abandono = true;
          if (jp.rol === "lider") {
            const perdedor = jp.equipo;
            const ganador = perdedor === "rojo" ? "azul" : "rojo";
            finalizarPartida(partida, ganador, "lider_abandono");
          }
        } else {
          if (jp.tag === partida.tag_creador) {
            partida.estado = "finalizada";
          }
          partida.jugadores = partida.jugadores.filter(j => j.idGoogle !== jugadorActual.idGoogle);
          broadcastLobby(partida);
        }
      }
      return noContent();
    }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// ARRANQUE
// ─────────────────────────────────────────────────────────────────────────────

export async function startMockServer() {
  if (!import.meta.env.DEV) return;
  try {
    const { setupWorker } = await import("msw/browser");
    const { http, HttpResponse } = await import("msw");
    const handlers = [
      ...buildHandlers(http, HttpResponse, ""),
      ...buildHandlers(http, HttpResponse, "http://localhost:8080"),
    ];
    const worker = setupWorker(...handlers);
    await worker.start({ onUnhandledRequest: "bypass", serviceWorker: { url: "/mockServiceWorker.js" } });
    console.log("╔═══════════════════════════════════════════════╗");
    console.log("║       Código Secreto — Mock Server Activo     ║");
    console.log("║  window.__mock  → estado global               ║");
    console.log("╚═══════════════════════════════════════════════╝");
  } catch (err) {
    console.warn("[Mock] MSW no disponible:", err.message);
    console.warn("[Mock] Ejecuta: npx msw init public/ --save");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEBUGGING (window.__mock)
// ─────────────────────────────────────────────────────────────────────────────

if (typeof window !== "undefined") {
  window.__mock = {
    get partidas() { return Object.fromEntries(partidas); },
    get jugador() { return jugadorActual; },
    get inventarioTemas() { return inventarioTemas; },
    get inventarioPersonalizaciones() { return inventarioPersonalizaciones; },
    get amigos() { return amigos; },
    get solicitudes() { return solicitudesPendientes; },
    get historial() { return historialPartidas; },
    get logros() { return progresoLogros; },
    crearPartidaTest(opts = {}) {
      return crearPartida({
        idTema: 1, es_publica: true, max_jugadores: 4, tiempoEspera: 60,
        creadorTag: jugadorActual.tag, creadorId: jugadorActual.idGoogle, ...opts,
      });
    },
    iniciarPartida(id) { const p = partidas.get(id); if (p) iniciarPartida(p); },
    darPista(id_partida, palabra = "OCEANO", numero = 2) { const p = partidas.get(id_partida); if (p) procesarPista(p, palabra, numero, jugadorActual.idGoogle); },
    votar(id_partida, idCarta) { const p = partidas.get(id_partida); if (p) procesarVoto(p, idCarta, jugadorActual.idGoogle); },
    finalizarPartida(id_partida, ganador = "rojo") { const p = partidas.get(id_partida); if (p) finalizarPartida(p, ganador, "manual"); },
    añadirBot(id_partida, tag = "Bot_Extra") {
      const p = partidas.get(id_partida);
      if (p) { añadirJugador(p, tag, `bot_${tag}_id`); broadcastLobby(p); }
    },
  };

  
}
export {
  partidas,
  topicClients,
  broadcast,
  broadcastGame,
  broadcastLobby,
  broadcastPublicas,
  lobbyDTO,
  gameStateDTO,
  procesarPista,
  procesarVoto,
  iniciarPartida,
  finalizarPartida,
  pasarTurno,
  detenerTemporizador,
  calcularhay_minimo,
  asignarRoles,
  añadirJugador,
  crearPartida,
};

if (typeof window !== "undefined") {
  window.__mockStompClient = MockStompClient;
}