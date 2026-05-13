/*
 * Pantalla de Login con Google OAuth. Es la pantalla que aparece nada más abrir la aplicación.
 */

import { ScreenFrame, ManilaFolder, RedStamp, FBISeal, TapeStrip } from "../components/ScreenFrame";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png';
import { useContext, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { loginConGoogle } from "../api/apiLogin";
import { obtenerEstadoPartida } from "../api/apiPartidas";
import { UserContext } from "../components/UserContext";

export function Pantalla01Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpieza preventiva para asegurar que no hay residuos de sesiones fallidas
    sessionStorage.removeItem('jwt_token');
    
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "session_invalidated") {
      alert("Tu sesión ha sido cerrada porque has iniciado sesión en otro dispositivo.");
      // Limpiar la URL sin recargar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Se extrae la función 'loginUsuario' del UserContext para poder acceder al contexto.
  const { loginUsuario } = useContext(UserContext);

  // Conexión con el botón oficial de google y procesamiento de la respuesta.
  const handleGoogleSuccess = async (respuestaGoogle) => {
    // Obtenemos el idToken seguro que nos da Google
    const idToken = respuestaGoogle.credential;

    try {
      
      // Se hace la petición al backend, enviando el id de Google del usuario y 
      // recibiendo su respuesta, usando la función del fichero 'apiLogin.js'.
      const res = await loginConGoogle(idToken);

      // Evaluamos la respuesta según nuestro contrato de API.
      if(res.es_nuevo === true){
        // El usuario es nuevo y tiene que configurar su tag.
        console.log("Usuario no registrado. Redirigiendo a la creación de tag...");
        // Pasamos el ID de Google a la siguiente pantalla para que pueda usarlo al registrar el Tag.
        navigate("/nombre-usuario-nuevo", { state: { idToken: idToken } });

      } else{
        // Para que acepte las notificaciones.
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        // El usuario ya existe.
        console.log("Acceso concedido. Redirigiendo al Home...");
        // Guardar el JWT en sessionStorage, para los WebSockets.
        if (res.token) {
          sessionStorage.setItem('jwt_token', res.token);
        }       
        // Se guardan los datos del jugador logueado en el UserContext.
        loginUsuario(res.jugador);

        // IMPORTANTE: para la reconexión.
        if (res.partida_activa_id) {

          // El jugador tiene una partida en curso y se le redirige a ella directamente.
          console.log("Partida en curso detectada. Reconectando...");

          // Obtener estado 
          const estadoPartida = await obtenerEstadoPartida(res.partida_activa_id);

          // En función del estado se redirige al lobby, partida o al home.
          if(estadoPartida === "esperando"){
            navigate(`/lobby/${res.partida_activa_id}`);
          } else if(estadoPartida === "en_curso"){
            navigate(`/partida/${res.partida_activa_id}`);
          } else{
            navigate("/home");
          }

        } else {
          // El jugador no tiene ninguna partida en curso. Redirección normal al Home.
          navigate("/home");
        }
      }

    } catch (error) {
      console.error("Infracción de seguridad o caída del servidor:", error);
      alert(error.message);
    }
  };

  const handleGoogleError = () => {
    console.error("Fallo al conectar con los satélites de Google.");
    alert("Fallo al conectar con los satélites de Google.");
  };

  // ------ Interfaz gráfica ------
  return (
    // Envolvemos toda la pantalla con el Provider obligatorio de Google
    // TODO: revisar si poner aquí el ID de localhost o del despliegue.
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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
                
                {/* Botón de HTML diseñado por el equipo (Comentado para preservar el SVG) 
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
                */}

              </div>

              {/* Botón OFICIAL de Google (Descomentado y activado) */}
              <div className="max-w-sm mx-auto flex justify-center py-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline" // Encaja bien con el fondo claro de la carpeta
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </div>

              {/* Bottom stamps */}
              <div className="flex items-center justify-between mt-6 flex-wrap gap-2">
                <RedStamp text="TOP SECRET" className="rotate-[-4deg]" />
                <span className="font-['Courier_Prime',monospace] text-[#403E3B]/50" style={{ fontSize: 8 }}>
                  NIVEL DE SEGURIDAD: ULTRA — REF: FBI-2976-XK
                </span>
              </div>
            </div>
          </ManilaFolder>
        </div>
      </ScreenFrame>
    </GoogleOAuthProvider>
  );
}