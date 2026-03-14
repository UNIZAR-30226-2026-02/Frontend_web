/*
 * Pantalla de logros y medallas del agente: Aquí se muestran los reconocimientos obtenidos por el jugador.
 Se divide en dos secciones principales: Logros Operativos (hitos) y Medallas de Servicio 
 (num partidas ganadas). 
 */
import React from "react";
import { 
  Trophy, Medal, Star, Shield, Crosshair, Eye, 
  Flame, Target, Users, Lock, Crown, ArrowLeft 
} from "lucide-react";
import { useNavigate } from "react-router";
import { 
  ScreenFrame, ManilaFolder, DarkCard, RedStamp, 
  FBISeal, SectionHeader, SubsectionLabel 
} from "../components/ScreenFrame";
import "../components/Logros.css";

// Configuración de medallas: asocia cada nivel con una clase CSS y un emoji (si queda muy cutre lo cambiamos)
const configuracionRareza = {
  bronce: { clase: "medalla-bronce", insignia: "🥉" },
  plata: { clase: "medalla-plata", insignia: "🥈" },
  oro: { clase: "medalla-oro", insignia: "🏅" },
  platino: { clase: "medalla-platino", insignia: "💎" },
};

// Listado de logros operativos: harcodeada basta por ahora
const listaLogros = [
  { icono: Crosshair, nombre: "Primera Misión", desc: "Completa tu primera partida", progreso: 1, max: 1, desbloqueado: true, rareza: "bronce" },
  { icono: Trophy, nombre: "Victoria Inaugural", desc: "Gana tu primera partida", progreso: 1, max: 1, desbloqueado: true, rareza: "bronce" },
  { icono: Flame, nombre: "En Racha", desc: "Gana 5 partidas consecutivas", progreso: 5, max: 5, desbloqueado: true, rareza: "plata" },
  { icono: Eye, nombre: "Jefe Experto", desc: "Gana 10 partidas como Jefe de Espionaje", progreso: 10, max: 10, desbloqueado: true, rareza: "plata" },
  { icono: Target, nombre: "Puntería Perfecta", desc: "Adivina 5 cartas en un solo turno", progreso: 5, max: 5, desbloqueado: true, rareza: "oro" },
  { icono: Shield, nombre: "Defensa Sólida", desc: "Gana sin revelar civiles", progreso: 3, max: 3, desbloqueado: true, rareza: "oro" },
  { icono: Users, nombre: "Líder de Escuadrón", desc: "Juega 50 partidas con amigos", progreso: 47, max: 50, desbloqueado: false, rareza: "plata" },
  { icono: Star, nombre: "Centurión", desc: "Gana 100 partidas", progreso: 79, max: 100, desbloqueado: false, rareza: "oro" },
  { icono: Crown, nombre: "Leyenda Viviente", desc: "Alcanza el rango de General", progreso: 0, max: 1, desbloqueado: false, rareza: "platino" },
  { icono: Crosshair, nombre: "Asesino Esquivado", desc: "Sobrevive al asesino 20 veces", progreso: 14, max: 20, desbloqueado: false, rareza: "plata" },
  { icono: Flame, nombre: "Inferno", desc: "Racha de 13 victorias seguidas", progreso: 5, max: 13, desbloqueado: false, rareza: "platino" },
];

// Listado de medallas de honor: Adecuar a las que se convengan
const listaMedallas = [
  { nombre: "Servicio Distinguido", emoji: "🎖️", desc: "100+ horas de juego", obtenida: true },
  { nombre: "Agente del Mes", emoji: "⭐", desc: "Mejor rendimiento mensual", obtenida: true },
  { nombre: "Maestro Espía", emoji: "🕵️", desc: "Ratio 70%+ como Jefe", obtenida: false },
  { nombre: "Héroe de Guerra", emoji: "🏆", desc: "Gana un torneo oficial", obtenida: false },
  { nombre: "Ojo de Halcón", emoji: "🦅", desc: "Precisión 90%+ en 10 partidas", obtenida: true },
  { nombre: "Superviviente", emoji: "💀", desc: "Sobrevive 50 partidas sin asesino", obtenida: false },
];

export function Pantalla10Logros() {
  const navegar = useNavigate();

  // Cálculos de estadísticas para la cabecera
  const totalDesbloqueados = listaLogros.filter(l => l.desbloqueado).length;
  const totalMedallasObtenidas = listaMedallas.filter(m => m.obtenida).length;
  const totalElementos = listaLogros.length + listaMedallas.length;
  
  // Porcentaje total de completado
  const progresoGlobal = Math.round(((totalDesbloqueados + totalMedallasObtenidas) / totalElementos) * 100);

  return (
    <ScreenFrame title="LOGROS Y MEDALLAS">
      <div className="max-w-5xl mx-auto pt-8 sm:pt-4">
        
        {/* Botón para retroceder al Dashboard : ESTO A LO MEJOR HABRÍA UE HACER UNA CLASE GENÉRICA PORQUE SE REPITE*/}
        <button 
          onClick={() => navegar("/dashboard")} 
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
              <TarjetaResumen icono={Trophy} valor={`${totalDesbloqueados}/${listaLogros.length}`} etiqueta="LOGROS" color="#d4b878" />
              <TarjetaResumen icono={Medal} valor={`${totalMedallasObtenidas}/${listaMedallas.length}`} etiqueta="MEDALLAS" color="#c4a060" />
              <TarjetaResumen icono={Star} valor="2" etiqueta="ORO" color="#f0c840" />
              <TarjetaResumen icono={Crown} valor="0" etiqueta="PLATINO" color="#c090e0" />
            </div>

            {/* Sección de Logros Operativos */}
            <SubsectionLabel icono={<Trophy className="w-4 h-4 text-[#5a4a30]" />} label="LOGROS OPERATIVOS" borderColor="#8b2020" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {listaLogros.map((logro) => (
                <ElementoLogro key={logro.nombre} logro={logro} />
              ))}
            </div>

            {/* Sección de Medallas de Servicio */}
            <SubsectionLabel icono={<Medal className="w-4 h-4 text-[#5a4a30]" />} label="MEDALLAS DE SERVICIO" borderColor="#5a4a20" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {listaMedallas.map((medalla) => (
                <ElementoMedalla key={medalla.nombre} medalla={medalla} />
              ))}
            </div>

            {/* Barra de Progreso General del Agente: NOS GUSTA EL MOMENTO ARCOÍRIS? NO SÉ SI PEGA CON LA ESTÉTICA */}
            <div className="bg-[#f5edd8]/40 border border-[#a08050]/20 rounded-sm p-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-elite text-[#4a3a20] tracking-[0.1em]" style={{ fontSize: 13 }}>PROGRESO TOTAL DEL AGENTE</span>
                <span className="font-courier text-[#5a4a30]" style={{ fontSize: 13 }}>{progresoGlobal}%</span>
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
              <span className="font-courier text-[#8a7a60]/50" style={{ fontSize: 9 }}>COD_DOC: FBI-RECOMPENSAS-1976</span>
              <RedStamp text="CLASIFICADO" className="rotate-[-3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}

// SUBCOMPONENTES AUXILIARES 

/**
 * Tarjeta pequeña para el resumen superior
 */
function TarjetaResumen({ icono: Icono, valor, etiqueta, color }) {
  return (
    <DarkCard className="p-4 text-center">
      <Icono className="w-6 h-6 mx-auto mb-2" style={{ color }} />
      <p className="font-courier" style={{ fontSize: 22, color }}>{valor}</p>
      <p className="font-courier text-[#888]" style={{ fontSize: 9 }}>{etiqueta}</p>
    </DarkCard>
  );
}

/**
 * Representación individual de un logro con su barra de progreso
 */
function ElementoLogro({ logro: l }) {
  const config = configuracionRareza[l.rareza];
  const porcentaje = Math.round((l.progreso / l.max) * 100);
  const Icono = l.icono;

  return (
    <DarkCard className={`achievement-card ${config.clase} ${!l.desbloqueado ? "opacity-70" : ""}`}>
      {/* Franja superior de medalla */}
      <div className="medalla-stripe" />
      
      <div className="flex items-start gap-3 mt-1">
        {/* Contenedor del Icono o Candado */}
        <div className="icon-container">
          {l.desbloqueado ? (
            <Icono className="w-5 h-5 text-[var(--rarity-text)]" />
          ) : (
            <Lock className="w-4 h-4 text-[#666]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-elite ${l.desbloqueado ? "text-[#e8dcc8]" : "text-[#888]"} truncate`} style={{ fontSize: 13 }}>
              {l.nombre}
            </p>
            <span style={{ fontSize: 14 }}>{config.insignia}</span>
          </div>
          <p className="font-courier text-[#888] mt-0.5" style={{ fontSize: 10 }}>{l.desc}</p>
          
          {/* Visualización del progreso */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1 font-courier" style={{ fontSize: 9 }}>
              <span className="text-[#666]">{l.progreso}/{l.max}</span>
              {l.desbloqueado && <span className="text-[#50a050]">✓ COMPLETADO</span>}
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${porcentaje}%`, 
                  backgroundColor: l.desbloqueado ? "#50a050" : "var(--rarity-color)" 
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
 * Representación individual de una medalla
 */
function ElementoMedalla({ medalla: m }) {
  return (
    <DarkCard className={`p-4 text-center ${!m.obtenida ? "opacity-50" : ""}`}>
      {/* Icono de la medalla con efecto gris si no se tiene */}
      <div className={`text-4xl mb-2 ${!m.obtenida ? "grayscale" : ""}`}>{m.emoji}</div>
      
      <p className={`font-elite ${m.obtenida ? "text-[#e8dcc8]" : "text-[#666]"} truncate`} style={{ fontSize: 11 }}>
        {m.nombre}
      </p>
      <p className="font-courier text-[#888] mt-1" style={{ fontSize: 8 }}>{m.desc}</p>
      
      {/* Estado de la medalla */}
      {m.obtenida ? (
        <div className="mt-2 inline-block bg-[#2a5a2a]/40 border border-[#50a050]/30 rounded-sm px-2 py-0.5">
          <span className="font-courier text-[#50a050]" style={{ fontSize: 8 }}>OBTENIDA</span>
        </div>
      ) : (
        <div className="mt-2">
          <Lock className="w-3 h-3 text-[#555] mx-auto" />
        </div>
      )}
    </DarkCard>
  );
}