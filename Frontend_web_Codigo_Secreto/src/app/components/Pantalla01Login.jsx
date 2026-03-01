/*
 * Pantalla de Login con Google OAuth. Es la pantalla que aparece nada más abrir la aplicación.
 */

import { ScreenFrame, ManilaFolder, RedStamp, FBISeal, TapeStrip } from "./ScreenFrame";
import { useNavigate } from "react-router";
import logo from '../../assets/logo.png';

export function Pantalla01Login() {
  const navigate = useNavigate();

  // ------ Interfaz gráfica ------
  return (
    <ScreenFrame title="ACCESO CLASIFICADO">
      <div className="flex items-center justify-center min-h-[80vh]">
        <ManilaFolder className="w-full max-w-xl">
          <div className="p-5 sm:p-8 md:p-10">
            {/* Top: tape + seal */}
            <div className="flex items-start justify-between mb-5">
              <TapeStrip className="rotate-[-5deg] -mt-2 -ml-2" />
              <FBISeal size={60} />
            </div>

            {/* Red stripe header */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#8b2020]/80 skew-y-[-0.3deg]" />
              <div className="relative py-2 px-4">
                <h1 className="font-['Special_Elite',cursive] text-white tracking-[0.1em] sm:tracking-[0.15em] text-center" style={{ fontSize: 'clamp(20px, 4vw, 28px)' }}>
                  ACCESO CLASIFICADO
                </h1>
              </div>
            </div>

            {/* Logo emblem */}
            <div className="flex justify-center mb-5">
                <img src={logo} alt="Logo" className="w-16 h-16 sm:w-30 sm:h-30 object-contain" />
           
            </div>

            {/* Form */}
            <div className="max-w-sm mx-auto space-y-4">
              
              {/* Botón de Google conectado al Hook */}
              <button 
                onClick={() => iniciarSesionConGoogle()} 
                className="w-full bg-white border-2 border-[#a08050]/30 py-2.5 flex items-center justify-center gap-3 rounded-sm hover:bg-[#faf5ea] transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-['Courier_Prime',monospace] text-[#3a3020]" style={{ fontSize: 12 }}>Iniciar sesión con Google</span>
              </button>
            </div>

            {/* Bottom stamps */}
            <div className="flex items-center justify-between mt-6 flex-wrap gap-2">
              <RedStamp text="TOP SECRET" className="rotate-[-4deg]" />
              <span className="font-['Courier_Prime',monospace] text-[#8a7a60]/50" style={{ fontSize: 8 }}>
                NIVEL DE SEGURIDAD: ULTRA — REF: FBI-2976-XK
              </span>
            </div>
          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}