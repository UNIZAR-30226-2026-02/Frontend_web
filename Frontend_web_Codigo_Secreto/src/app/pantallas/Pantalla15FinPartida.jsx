/*
 * Pantalla de fin de partida.
 */

import React, { useState, useEffect } from 'react'; // AÑADIDO: useEffect
import { useNavigate, useParams } from 'react-router'; // AÑADIDO: useParams
// Asumimos que estos componentes visuales existen en tu proyecto
// basándonos en la estética de pantallas anteriores de "Manila Folder"
import { ManilaFolder, SectionHeader, RedStamp, TapeStrip, FBISeal } from "../components/ScreenFrame"; 
import { Home, BarChart3, Users, Award, ArrowLeft } from "lucide-react";

// AÑADIDO: Base URL para la API
const API_BASE = "http://localhost:8080/api";

export function Pantalla15FinPartida() {
  const navigate = useNavigate();
  const { id_partida } = useParams(); // AÑADIDO: Capturamos el id de la URL

  // --- AÑADIDO: Estados de integración con el backend ---
  const [datosFinales, setDatosFinales] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // --- AÑADIDO: Llamada GET a la API ---
  useEffect(() => {
    const fetchResultados = async () => {
      try {
        const res = await fetch(`${API_BASE}/partida/${id_partida}/fin`, {
          credentials: "include"
        });
        if (!res.ok) {
          throw new Error("No se ha podido recuperar el informe de la misión.");
        }
        const data = await res.json();
        setDatosFinales(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    if (id_partida) fetchResultados();
  }, [id_partida]);

  // // TODO: integrar con backend.
  // // Estado ganador de prueba.
  // const [ganadorSimulado, setGanadorSimulado] = useState('Rojo'); 

  // // Datos de prueba.
  // const mockData = {
  //   equipo_ganador: ganadorSimulado, // 'Rojo' o 'Azul'
  //   aciertos_rojo: 8,
  //   aciertos_azul: 6,
  //   total_cartas: 25,
  //   duracion_turnos: 12,
  //   codigos_operativos: "F4V3M6"
  // };

  // const { equipo_ganador, aciertos_rojo, aciertos_azul, codigos_operativos } = mockData;

  // --- AÑADIDO: Extracción de variables recibidas desde el endpoint ---
  const equipo_ganador = datosFinales?.equipo_ganador || 'Rojo'; 
  const aciertos_rojo = datosFinales?.aciertos_rojo || 0;
  const aciertos_azul = datosFinales?.aciertos_azul || 0;
  
  // Dependiendo de cómo lo envíe tu backend (ej. "rojo" vs "Rojo"), quizá 
  // debas usar: equipo_ganador?.toLowerCase() === 'rojo'
  const esRojoGanador = equipo_ganador === 'Rojo';

  // Configuración visual condicional según el ganador
  const colorPrimarioGanador = esRojoGanador ? "text-[#8B2020]" : "text-[#80a0d0]";
  const bgBanderaGanador = esRojoGanador ? "bg-[#8b2020]/80" : "bg-[#80a0d0]";
  const bordeGanador = esRojoGanador ? "border-[#8B2020]" : "border-[#80a0d0]";

  // --- AÑADIDO: Vistas de Carga y Error ---
  if (cargando) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center font-['Courier_Prime',monospace]">
        <p className="text-[#c4a060] tracking-widest uppercase">RECUPERANDO INFORME CLASIFICADO...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center font-['Courier_Prime',monospace] p-4 text-center">
        <p className="text-[#cc3333] mb-4">ERROR AL DESENCRIPTAR INFORME: {error}</p>
        <button onClick={() => navigate("/home")} className="text-[#c4a060] border border-[#c4a060] px-4 py-2 hover:bg-[#c4a060]/10">VOLVER AL ESCRITORIO</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-4 sm:p-8 lg:p-12 pt-16 sm:pt-12 font-['Courier_Prime',monospace]">
      <div className="max-w-4xl mx-auto relative">

        <button
            onClick={() => navigate("/home")}
            className="back-btn group"
        >
            <ArrowLeft className="back-btn-icon" />
            <span className="back-btn-text">VOLVER AL ESCRITORIO</span>
        </button>

        {/* Contenedor Principal: Carpeta Manila con Binder Clip */}
        <ManilaFolder showTab={false} showClip={true}>
          <div className="p-5 sm:p-8 lg:p-10 relative">
            
            {/* Sello de agua FBI de fondo (baja opacidad) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <FBISeal size={400} />
            </div>

            {/* Encabezado del Informe */}
            <div className="flex items-start justify-between mb-8 border-b-2 border-black/10 pb-4 flex-wrap gap-4 relative z-10">
              <div className="flex-1 min-w-[280px]">
                <SectionHeader title="INFORME DE CLASIFICACIÓN FINAL" />
                <p className="text-[#5a4a30] text-xs mt-1 uppercase tracking-wider">
                  Estado de la Misión: <span className="font-bold">FINALIZADA</span>
                </p>
              </div>
              {/* Botón visual para cambiar ganador en el MOCK. TODO: eliminar */}
              {/* COMENTADO: Ya no se necesita el mock de estado.
              <button 
                onClick={() => setGanadorSimulado(prev => prev === 'Rojo' ? 'Azul' : 'Rojo')}
                className="text-[9px] bg-black/5 px-2 py-1 rounded text-[#5a4a30] hover:bg-black/10"
              >
              </button>
              */}
            </div>

            {/* ─── SECCIÓN CENTRAL: ANUNCIO DE VICTORIA ─── */}
            <div className="relative mb-12 mt-6 z-10">
              {/* Sello "CLASSIFIED" angulado de fondo */}
              <div className="absolute -top-10 -right-4 opacity-10 rotate-[15deg] pointer-events-none">
                <RedStamp text="CLASSIFIED" size="large" />
              </div>

              <div className="text-center flex flex-col items-center justify-center p-6 bg-white/30 border border-black/5 rounded-sm shadow-inner relative">
                <p className="text-sm text-[#5a4a30] uppercase tracking-widest mb-2 font-bold">La red de espionaje confirma:</p>
                
                {/* Bandera del Ganador */}
                <div className={`${bgBanderaGanador} text-white px-8 py-4 rounded-sm shadow-lg rotate-[-1deg] inline-block my-2 border-2 border-black/10`}>
                  <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Victoria Absoluta para el</p>
                  <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight [text-shadow:2px_2px_0px_rgba(0,0,0,0.2)]">
                    Equipo {equipo_ganador}
                  </h1>
                </div>

                <div className="flex items-center gap-2 mt-4 text-[#5a4a30]">
                  <Award className={`w-5 h-5 ${colorPrimarioGanador}`} />
                  <p className="text-sm">Red de agentes rivales desmantelada con éxito.</p>
                </div>
              </div>
            </div>

            {/* ─── SECCIÓN INFERIOR: MARCADOR DE ACIERTOS ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 relative z-10">
              
              {/* Tarjeta Marcador ROJO */}
              <div className={`p-6 rounded-sm shadow-md border-t-4 ${bordeGanador} relative overflow-hidden flex items-center justify-between gap-4 ${esRojoGanador ? 'bg-[#f8f0e0]' : 'bg-[#efe6d5]'}`}>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 bg-[#8b2020]/80 shadow-[0_0_5px_rgba(233,60,60,0.5)]`} />
                    <h3 className="text-lg font-bold text-[#3a2a10] uppercase tracking-tight">Agentes Rojos</h3>
                  </div>
                  <p className="text-xs text-[#5a4a30] leading-tight">Identidades operativas<br/>descubiertas con éxito</p>
                </div>
                {/* Puntuación Gigante */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-6xl font-bold tracking-tight text-[#8b2020]/80 [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]`}>
                    {aciertos_rojo}
                  </span>
                </div>
              </div>

              {/* Tarjeta Marcador AZUL */}
              <div className={`p-6 rounded-sm shadow-md border-t-4 ${bordeGanador} relative overflow-hidden flex items-center justify-between gap-4 ${!esRojoGanador ? 'bg-[#f8f0e0]' : 'bg-[#efe6d5]'}`}>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 bg-[#80a0d0] shadow-[0_0_5px_rgba(46,132,215,0.5)]`} />
                    <h3 className="text-lg font-bold text-[#3a2a10] uppercase tracking-tight">Agentes Azules</h3>
                  </div>
                  <p className="text-xs text-[#5a4a30] leading-tight">Identidades operativas<br/>descubiertas con éxito</p>
                </div>
                {/* Puntuación Gigante */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-6xl font-bold tracking-tight text-[#80a0d0] [text-shadow:2px_2px_0px_rgba(0,0,0,0.1)]`}>
                    {aciertos_azul}
                  </span>
                </div>
              </div>
            </div>

            {/* Espacio de pie de página. */}
            <div className="flex items-center justify-between gap-4 pt-6 flex-wrap relative z-10">
            </div>
          </div>
        </ManilaFolder>

        {/* Decoración inferior: Sello de 'Misión cumplida' */}
        <div className="absolute bottom-11 left-8 z-20 rotate-[-10deg] opacity-90">
          <RedStamp text="MISION CUMPLIDA" size="medium" />
        </div>
      </div>
    </div>
  );
}