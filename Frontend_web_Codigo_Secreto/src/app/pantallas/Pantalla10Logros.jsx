/*
 * Pantalla de logros y medallas del agente.
 * RF-7: Los usuarios registrados pueden consultar su colección de logros y medallas desbloqueadas.
 * 
 * Los logros y medallas se definen según el diccionario de datos del proyecto:
 * 
 * LOGROS (cada uno otorga 50 balas al desbloquearse):
 * - Agente principiante: primera partida completada.
 * - Agente de entrenamiento: 20 partidas jugadas.
 * - Agente oficial: 50 partidas jugadas.
 * - Agente inspector: 100 partidas jugadas.
 * - Sociable: 5 amigos añadidos.
 * - Puntería extrema: acabar una partida sin fallos.
 * - Fiebre de balas: adquirir todos los paquetes de cartas y temas visuales de la tienda.
 * 
 * MEDALLAS (insignias por partidas ganadas):
 * - Agente de bronce: 50 partidas ganadas. Insignia color bronce.
 * - Agente de plata: 100 partidas ganadas. Insignia color plateado.
 * - Agente de oro: 200 partidas ganadas. Insignia color dorado.
 * 
 * La pantalla obtiene los datos del perfil del usuario (progreso de partidas, amigos, etc.)
 * y calcula el estado de cada logro/medalla. Se muestra el porcentaje de progreso global,
 * la colección desbloqueada y un resumen estadístico.
 */
import React from "react";
import {
  Trophy, Medal, Star, Shield, Crosshair, Eye,
  Flame, Target, Users, Lock, Crown, ArrowLeft, Gamepad2, ShoppingBag
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  ScreenFrame, ManilaFolder, DarkCard, RedStamp,
  FBISeal, SectionHeader, SubsectionLabel
} from "../components/ScreenFrame";
import "../components/Logros.css";

// Configuración de rareza para estilos visuales
const configuracionRareza = {
  bronce: { clase: "medalla-bronce", insignia: "🥉", color: "#cd7f32" },
  plata: { clase: "medalla-plata", insignia: "🥈", color: "#c0c0c0" },
  oro: { clase: "medalla-oro", insignia: "🏅", color: "#ffd700" },
  platino: { clase: "medalla-platino", insignia: "💎", color: "#b0c4de" },
};

// DEFINICIÓN DE LOGROS SEGÚN DICCIONARIO
// Cada logro tiene:
// - id: identificador único
// - nombre: nombre visible
// - descripcion: texto explicativo
// - condicion: { actual, max } para calcular progreso (actual se obtiene del perfil)
// - rareza: asignada según dificultad (usamos la configuración de rareza)
// - recompensa: 50 balas
// - icono: componente Lucide (representativo)
// - desbloqueado: booleano calculado

// Icono decorativo por nombre de logro (to cutre yo que sé)
function IconoPorNombre({ nombre, className = "w-5 h-5" }) {
  const n = nombre?.toLowerCase() || "";
  if (n.includes("misión") || n.includes("partida")) return <Gamepad2 className={className} />;
  if (n.includes("victoria") || n.includes("oficial") || n.includes("inspector")) return <Trophy className={className} />;
  if (n.includes("medalla") || n.includes("bronce") || n.includes("plata") || n.includes("oro")) return <Medal className={className} />;
  if (n.includes("puntería") || n.includes("extrema")) return <Target className={className} />;
  if (n.includes("sociable") || n.includes("amigo")) return <Users className={className} />;
  if (n.includes("corona") || n.includes("líder") || n.includes("inspector")) return <Crown className={className} />;
  if (n.includes("fiebre") || n.includes("balas") || n.includes("tienda")) return <ShoppingBag className={className} />;
  return <Star className={className} />;
}

/*
const listaLogros = [
  {
    id: "principiante",
    nombre: "Agente principiante",
    descripcion: "Completa tu primera partida",
    condicion: { max: 1 },
    rareza: "bronce",
    recompensa: 50,
    icono: Gamepad2,
  },
  {
    id: "entrenamiento",
    nombre: "Agente de entrenamiento",
    descripcion: "Juega 20 partidas",
    condicion: { max: 20 },
    rareza: "bronce",
    recompensa: 50,
    icono: Star,
  },
  {
    id: "oficial",
    nombre: "Agente oficial",
    descripcion: "Juega 50 partidas",
    condicion: { max: 50 },
    rareza: "plata",
    recompensa: 50,
    icono: Trophy,
  },
  {
    id: "inspector",
    nombre: "Agente inspector",
    descripcion: "Juega 100 partidas",
    condicion: { max: 100 },
    rareza: "oro",
    recompensa: 50,
    icono: Crown,
  },
  {
    id: "sociable",
    nombre: "Sociable",
    descripcion: "Añade 5 amigos",
    condicion: { max: 5 },
    rareza: "plata",
    recompensa: 50,
    icono: Users,
  },
  {
    id: "punteria",
    nombre: "Puntería extrema",
    descripcion: "Acaba una partida sin fallos",
    condicion: { max: 1 }, // booleano
    rareza: "oro",
    recompensa: 50,
    icono: Target,
  },
  {
    id: "fiebre",
    nombre: "Fiebre de balas",
    descripcion: "Adquiere todos los paquetes de cartas y temas visuales",
    condicion: { max: 1 },
    rareza: "platino",
    recompensa: 50,
    icono: ShoppingBag,
  },
];

// DEFINICIÓN DE MEDALLAS SEGÚN DICCIONARIO-
const listaMedallas = [
  {
    id: "bronce",
    nombre: "Agente de bronce",
    descripcion: "50 partidas ganadas",
    partidasRequeridas: 50,
    emoji: "🥉",
    rareza: "bronce",
  },
  {
    id: "plata",
    nombre: "Agente de plata",
    descripcion: "100 partidas ganadas",
    partidasRequeridas: 100,
    emoji: "🥈",
    rareza: "plata",
  },
  {
    id: "oro",
    nombre: "Agente de oro",
    descripcion: "200 partidas ganadas",
    partidasRequeridas: 200,
    emoji: "🏅",
    rareza: "oro",
  },
];

*/
/*// DATOS DE EJEMPLO DEL PERFIL DEL USUARIO (en producción vendrán del backend)
const perfilEjemplo = {
  partidasJugadas: 1,      // partidas totales jugadas
  partidasGanadas: 1,       // partidas ganadas
  amigos: 1,                 // amigos añadidos
  partidaSinFallos: false,   // si alguna vez acabó sin fallos (logro puntería)
  todosPaquetes: false,      // si tiene todos los paquetes y temas (fiebre de balas)
};
*/
// FUNCIONES DE CÁLCULO DE PROGRESO (simulan lógica de backend)

/**
 * Calcula el estado de cada logro a partir del perfil del usuario.
 * Devuelve una copia de listaLogros con los campos calculados:
 * - progreso: valor actual (0..max)
 * - desbloqueado: boolean
 * - max: número máximo para completar
 
const calcularLogros = (perfil) => {
  return listaLogros.map(logro => {
    let progreso = 0;
    let max = logro.condicion.max;
    let desbloqueado = false;

    switch (logro.id) {
      case "principiante":
      case "entrenamiento":
      case "oficial":
      case "inspector":
        progreso = Math.min(perfil.partidasJugadas, max);
        desbloqueado = perfil.partidasJugadas >= max;
        break;
      case "sociable":
        progreso = Math.min(perfil.amigos, max);
        desbloqueado = perfil.amigos >= max;
        break;
      case "punteria":
        progreso = perfil.partidaSinFallos ? 1 : 0;
        desbloqueado = perfil.partidaSinFallos;
        break;
      case "fiebre":
        progreso = perfil.todosPaquetes ? 1 : 0;
        desbloqueado = perfil.todosPaquetes;
        break;
      default:
        progreso = 0;
    }
    return {
      ...logro,
      progreso,
      max,
      desbloqueado,
    };
  });
};


 * Calcula las medallas obtenidas según las partidas ganadas.
 
const calcularMedallas = (partidasGanadas) => {
  return listaMedallas.map(medalla => ({
    ...medalla,
    obtenida: partidasGanadas >= medalla.partidasRequeridas,
  }));
};
*/
// COMPONENTE PRINCIPAL
export function Pantalla10Logros() {
  const navigate = useNavigate();

  /*// Obtener datos calculados del perfil
  const logros = calcularLogros(perfilEjemplo);
  const medallas = calcularMedallas(perfilEjemplo.partidasGanadas);

  // Estadísticas
  const totalLogros = logros.length;
  const logrosDesbloqueados = logros.filter(l => l.desbloqueado).length;
  const totalMedallas = medallas.length;
  const medallasObtenidas = medallas.filter(m => m.obtenida).length;

  // Balas ganadas por logros desbloqueados
  const balasGanadas = logrosDesbloqueados * 50;

  // Progreso global (logros + medallas)
  const totalElementos = totalLogros + totalMedallas;
  const totalDesbloqueados = logrosDesbloqueados + medallasObtenidas;
  const progresoGlobal = Math.round((totalDesbloqueados / totalElementos) * 100);
  */

  const [logros, setLogros]     = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);
 
  useEffect(() => {
    obtenerLogros()
      .then(data => setLogros(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, []);
 
  if (cargando) {
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
        <button onClick={() => navigate("/home")} className="font-['Courier_Prime',monospace] text-[#8a7a60]">← Volver</button>
      </div>
    );
  }

  const medallas          = logros.filter(l => l.es_logro === false);
  const logrosNormales    = logros.filter(l => l.es_logro === true);
  const totalLogros       = logrosNormales.length;
  const totalMedallas     = medallas.length;
  const logrosDesbloq     = logrosNormales.filter(l => l.completado).length;
  const medallasObt       = medallas.filter(l => l.completado).length;
  const totalElem         = totalLogros + totalMedallas;
  const totalDesbloq      = logrosDesbloq + medallasObt;
  const progresoGlobal    = totalElem > 0 ? Math.round((totalDesbloq / totalElem) * 100) : 0;
  const balasGanadas      = logros.filter(l => l.completado && l.balas_recompensa > 0)
                                  .reduce((s, l) => s + (l.balas_recompensa || 0), 0);

  return (
    <ScreenFrame title="LOGROS Y MEDALLAS">
      <div className="max-w-5xl mx-auto pt-8 sm:pt-4">
        
        {/* Botón volver al dashboard (RF-2, navegación) */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-[#8a7a60] hover:text-[#d4b878] transition-colors cursor-pointer mb-4 group font-courier"
          style={{ fontSize: 11 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>VOLVER AL ESCRITORIO</span>
        </button>

        <ManilaFolder>
          <div className="p-4 sm:p-6 lg:p-8">
            
            {/* Etiqueta decorativa de la carpeta */}
            <div className="absolute -top-0 left-6 bg-[#b89055] px-4 py-1.5 rounded-b-sm border-x border-b border-[#a08040] shadow-sm z-10 font-courier">
              <span className="text-[#2a1a08]" style={{ fontSize: 9 }}>EXPEDIENTE_RECOMPENSAS</span>
            </div>

            {/* Cabecera del documento */}
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3 mt-2">
              <div>
                <SectionHeader title="LOGROS Y MEDALLAS" />
                <p className="font-courier text-[#6a5a40] mt-1" style={{ fontSize: 11 }}>
                  Reconocimientos por servicio excepcional al cuerpo de inteligencia
                </p>
              </div>
              <FBISeal size={50} />
            </div>

            {/* Fichas de resumen estadístico */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <TarjetaResumen
                icono={Trophy}
                valor={`${logrosDesbloq}/${totalLogros}`}
                etiqueta="LOGROS"
                color="#d4b878"
              />
              <TarjetaResumen
                icono={Medal}
                valor={`${medallasObt}/${totalMedallas}`}
                etiqueta="MEDALLAS"
                color="#c4a060"
              />
              <TarjetaResumen
                icono={Flame}
                valor={balasGanadas}
                etiqueta="BALAS GANADAS"
                color="#50a050"
              />
              <TarjetaResumen
                icono={Crown}
                valor={perfilEjemplo.partidasGanadas}
                etiqueta="PARTIDAS GANADAS"
                color="#c090e0"
              />
            </div>

            {/* Sección de Logros Operativos (RF-7) */}
            <SubsectionLabel
              icono={<Trophy className="w-4 h-4 text-[#5a4a30]" />}
              label="LOGROS OPERATIVOS"
              borderColor="#8b2020"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {logros.map((logro) => (
                <ElementoLogro key={logro.id} logro={logro} />
              ))}
            </div>

            {/* Sección de Medallas de Servicio */}
            <SubsectionLabel
              icono={<Medal className="w-4 h-4 text-[#5a4a30]" />}
              label="MEDALLAS DE SERVICIO"
              borderColor="#5a4a20"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 mb-6">
              {medallas.map((medalla) => (
                <ElementoMedalla key={medalla.id} medalla={medalla} />
              ))}
            </div>

            {/* Barra de Progreso General del Agente */}
            <div className="bg-[#f5edd8]/40 border border-[#a08050]/20 rounded-sm p-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-elite text-[#4a3a20] tracking-[0.1em]" style={{ fontSize: 13 }}>
                  PROGRESO TOTAL DEL AGENTE
                </span>
                <span className="font-courier text-[#5a4a30]" style={{ fontSize: 13 }}>
                  {progresoGlobal}%
                </span>
              </div>
              <div className="h-3 bg-[#3a3020]/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b2020] via-[#d4a020] to-[#50a050] transition-all duration-1000"
                  style={{ width: `${progresoGlobal}%` }}
                />
              </div>
            </div>

            {/* Pie de página con sellos */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-courier text-[#8a7a60]/50" style={{ fontSize: 9 }}>
                COD_DOC: FBI-RECOMPENSAS-1976
              </span>
              <RedStamp text="CLASIFICADO" className="rotate-[-3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}

// -----------------------------------------------------------------------------
// SUBCOMPONENTES AUXILIARES
// -----------------------------------------------------------------------------

/**
 * Tarjeta pequeña para el resumen superior.
 * Muestra icono, valor numérico y etiqueta.
 */
function TarjetaResumen({ icono: Icono, valor, etiqueta, color }) {
  return (
    <DarkCard className="p-4 text-center">
      <Icono className="w-6 h-6 mx-auto mb-2" style={{ color }} />
      <p className="font-courier" style={{ fontSize: 22, color }}>
        {valor}
      </p>
      <p className="font-courier text-[#888]" style={{ fontSize: 9 }}>
        {etiqueta}
      </p>
    </DarkCard>
  );
}

/**
 * Representación individual de un logro con barra de progreso.
 * Recibe un objeto 'logro' que ya contiene 'progreso', 'max' y 'desbloqueado'.
 */
function ElementoLogro({ logro }) {
  const config = configuracionRareza[logro.rareza];
  const porcentaje = Math.round((logro.progreso_actual / logro.progreso_max) * 100);
  const Icono = logro.icono;

  return (
    <DarkCard
      className={`achievement-card ${config.clase} ${!logro.completado ? "opacity-70" : ""}`}
    >
      {/* Franja superior decorativa */}
      <div className="medalla-stripe" />

      <div className="flex items-start gap-3 mt-1">
        {/* Icono o candado según desbloqueo */}
        <div className="icon-container">
          {logro.completado ? (
            <Icono className="w-5 h-5 text-[var(--rarity-text)]" />
          ) : (
            <Lock className="w-4 h-4 text-[#666]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`font-elite ${logro.completado ? "text-[#e8dcc8]" : "text-[#888]"} truncate`}
              style={{ fontSize: 13 }}
            >
              {logro.nombre}
            </p>
            <span style={{ fontSize: 14 }}>{config.insignia}</span>
          </div>
          <p className="font-courier text-[#888] mt-0.5" style={{ fontSize: 10 }}>
            {logro.descripcion}
          </p>

          {/* Barra de progreso y contador */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1 font-courier" style={{ fontSize: 9 }}>
              <span className="text-[#666]">
                {logro.progreso_actual}/{logro.progreso_max}
              </span>
              {logro.completado ? (
                <span className="text-[#50a050]">✓ COMPLETADO</span>
              ) : (
                <span className="text-[#a0a060]">+{logro.balas_recompensa} balas</span>
              )}
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-fill"
                style={{
                  width: `${porcentaje}%`,
                  backgroundColor: logro.completado ? "#50a050" : config.color,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </DarkCard>
  );
}

/**
 * Representación individual de una medalla.
 * Muestra emoji, nombre, descripción y estado obtenida/no obtenida.
 */
function ElementoMedalla({ medalla }) {
  const obtenida = medalla.obtenida;

  return (
    <DarkCard className={`p-4 text-center ${!obtenida ? "opacity-50" : ""}`}>
      <div className={`text-4xl mb-2 ${!obtenida ? "grayscale" : ""}`}>
        {medalla.emoji}
      </div>
      <p
        className={`font-elite ${obtenida ? "text-[#e8dcc8]" : "text-[#666]"} truncate`}
        style={{ fontSize: 11 }}
      >
        {medalla.nombre}
      </p>
      <p className="font-courier text-[#888] mt-1" style={{ fontSize: 8 }}>
        {medalla.descripcion}
      </p>

      {obtenida ? (
        <div className="mt-2 inline-block bg-[#2a5a2a]/40 border border-[#50a050]/30 rounded-sm px-2 py-0.5">
          <span className="font-courier text-[#50a050]" style={{ fontSize: 8 }}>
            OBTENIDA
          </span>
        </div>
      ) : (
        <div className="mt-2">
          <Lock className="w-3 h-3 text-[#555] mx-auto" />
        </div>
      )}
    </DarkCard>
  );
}