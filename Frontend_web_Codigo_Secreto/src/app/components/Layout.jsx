/* * Fichero con la estética de la estructura principal de todas las pantallas de la aplicación. 
 * MODIFICADO: Se ha añadido soporte para música de fondo y efectos de sonido globales.
 */

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import woodTexture from '../../assets/wood.png';
import { IconoBala } from "./iconoBala";
import { UserContext } from "./UserContext";
import { useContext } from "react";

// Importaciones de todos los avatares disponibles
import Magia from '../../assets/1_magia.jpeg';
import Hist from '../../assets/2_historico.jpeg';
import Subm from "../../assets/3_vidasubmarina.jpeg";
import Cyber from "../../assets/4_cyberpunk.jpeg";
import Natur from "../../assets/5_naturaleza.jpeg";

// Importaciones para el sistema de sonido
import { BackgroundMusic } from '../context/MusicaFondo';
import { GlobalSoundEffects } from '../context/GlobalSoundEffects';
// Importación para las notificaciones globales del usuario.
import { NotificacionesProvider } from '../context/NotificacionesContext';

// Pantallas en las que NO se van a mostrar los iconos persistentes de las esquinas 
// (foto de agente ni contador de balas).
const hideProfileRoutes = ["/","/login", "/partida","/manual", "/nombre-usuario-nuevo", "/perfil"];
const hideBulletsRoutes = ["/","/login", "/partida","/manual", "/nombre-usuario-nuevo", "/tienda"];
// Pantallas en las que NO se quiere mostrar el icono del manual.
const hideManualRoutes = ["/","/login","/manual", "/nombre-usuario-nuevo"];

// Mapa para vincular el ID de la base de datos con la imagen importada
const MAPA_AVATARES = {
  1: Magia,
  2: Hist,
  3: Subm,
  4: Cyber,
  5: Natur,
};

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideProfile = hideProfileRoutes.some(r => location.pathname === r || location.pathname.startsWith(`${r}/`));
  const hideBullets = hideBulletsRoutes.some(r => location.pathname === r || location.pathname.startsWith(`${r}/`));
  const hideManual = hideManualRoutes.some(r => location.pathname === r || location.pathname.startsWith(`${r}/`));

  // Se usa UserContext, que contiene el objeto del Jugador logueado con toda la información actualizada.
  const { user, isLoading } = useContext(UserContext);

  // PANTALLA DE CARGA (Mientras el backend valida la cookie)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <span className="font-['Courier_Prime',monospace] text-[#c4a060]">
          VERIFICANDO CREDENCIALES...
        </span>
      </div>
    );
  }

  // LÓGICA PARA BALAS Y FOTO (Con fallback por si user es null)
  const balas = user?.balas ?? 0;
  
  // Extraemos la foto en string/number y la mapeamos a la imagen real (por defecto Magia)
  const idFoto = user?.foto_perfil ? Number(user.foto_perfil) : 1;
  const fotoDePerfilSrc = MAPA_AVATARES[idFoto] || Magia;

  return (
    // Envolvemos toda la aplicación con NotificacionesProvider para que los componentes hijos
    // puedan acceder al contexto de notificaciones
    <NotificacionesProvider>

      {/* Componente que gestiona la música de fondo (inicio automático tras primera interacción) */}
      <BackgroundMusic />
      
      {/* Componente que escucha eventos globales (click, tecleo) y reproduce efectos de sonido */}
      <GlobalSoundEffects />

      {/* Contenedor principal con el estilo de fondo de madera (sin cambios) */}
      <div
        className="min-h-screen flex flex-col relative"
        style={{
          // Imagen de fondo de madera.
          backgroundImage: `url(${woodTexture})`,
          backgroundColor: '#2a1204', // Color de respaldo oscuro
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed' // Mantiene la madera fija al hacer scroll
        }}
      >
        {/* CAPA DE SOMBRA PERIMETRAL (Vignette) 
            Esto oscurece los bordes para que parezca una mesa bajo una lámpara */}
        <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

        {/* ====== Iconos persistentes en las esquinas ====== */}
        {!hideProfile && user && (  // Solo se muestra si hay sesión.
          <>
            {/* Agent photo — top left → Profile */}
            <button
              onClick={() => navigate("/perfil")}
              className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 group cursor-pointer"
              title="Expediente del Agente"
            >
              <div className="relative">
                {/* Polaroid frame */}
                <div className="bg-[#f0e8d4] p-[3px] pb-[10px] shadow-[2px_3px_10px_rgba(0,0,0,0.6)] rotate-[-4deg] group-hover:rotate-[-1deg] transition-transform">
                    {/* Imagen actual del agente mapeada desde el UserContext */}
                    <img src={fotoDePerfilSrc} alt="Avatar" className="w-8 h-8 sm:w-12 sm:h-12 object-cover"  />
                </div>
                {/* Red dot */}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#cc3333] rounded-full border border-[#8b2020] shadow-[0_0_6px_rgba(200,50,50,0.5)]" />
              </div>
            </button>
          </>
        )}

        {!hideBullets && (
          <>
            {/* Bullet count — top right, below manual */}
            <div className="fixed top-14 right-3 sm:top-16 sm:right-4 z-50">
              <div className="flex items-center gap-1.5 bg-[#1a1208]/90 border border-[#5a4a20]/30 rounded-sm px-2 py-1 shadow-[1px_2px_6px_rgba(0,0,0,0.4)]">
                <IconoBala size={15} />
                {/* Balas de prueba 
                <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 13 }}>500</span>
                */}
                {/* Balas dinámicas del usuario */}
                <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 13 }}>
                  {balas}
                </span>
              </div>
            </div>
          </>
        )}

        {!hideManual && (
          <>
            {/* Manual Operativo — top right → Settings */}
            <button
              onClick={() => navigate("/manual")}
              className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 group cursor-pointer"
              title="Manual Operativo"
            >
              <div className="bg-[#2a2218]/90 border border-[#5a4a30]/40 rounded-sm p-1.5 sm:p-2 shadow-[2px_3px_10px_rgba(0,0,0,0.5)] group-hover:bg-[#3a3020]/90 transition-colors">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#c4a060] group-hover:text-[#d4b878] transition-colors" />
              </div>
            </button>
          </>
        )}

        {/* ====== CONTENIDO PRINCIPAL ====== */}
        <main className="flex-1 relative z-10 bg-transparent">
          <Outlet />
        </main>
      </div>
    </NotificacionesProvider>
  );
}