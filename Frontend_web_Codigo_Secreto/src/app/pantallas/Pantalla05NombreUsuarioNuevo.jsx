/*
 * Pantalla inicial para que un nuevo usuario escriba su nombre único.
 */

import { useState, useEffect, useContext } from 'react';
import { ScreenFrame, ManilaFolder, RedStamp, FBISeal, TapeStrip } from "../components/ScreenFrame";
import { useNavigate, useLocation } from "react-router-dom";
import { registroNuevoUsuario } from "../api/apiLogin";
import { UserContext } from "../components/UserContext";

export function Pantalla05NombreUsuarioNuevo() {
  const navigate = useNavigate();
  const location = useLocation();

  // Se extrae la función 'loginUsuario' del UserContext para poder acceder al contexto.
  const { loginUsuario } = useContext(UserContext);
  
  // Recuperamos el idToken enviado desde la Pantalla01Login, que había proporcionado
  // Google para el usuario actual. Es necesario para enviárselo al backend.
  const idToken = location.state?.idToken;

  const [tag, setTag] = useState('');
  const [errorMensaje, setErrorMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // Medida de seguridad: Si alguien entra a esta URL directamente sin venir de Google, 
  // se le redirige al login
  useEffect(() => {
    if (!idToken) {
      console.warn("Intento de acceso sin idToken de Google. Redirigiendo al Login.");
      navigate("/");
    }
  }, [idToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    
    if (tag.trim().length < 3) {
      setErrorMensaje("El nombre en clave debe tener al menos 3 caracteres.");
      return;
    }

    setCargando(true);
    setErrorMensaje('');

    try {
      // Llamada al endpoint de registro de AuthController.java para crear el nuevo usuario 
      // enviándole su token de Google y el nombre (tag) único que ha elegido.
      const res = await registroNuevoUsuario(idToken, tag.trim());

      // Caso de éxito: El usuario se ha guardado en BD y nos devuelven el JWT
  
      // Guardar el JWT en sessionStorage, para los WebSockets. 
      if (res.token) {
        sessionStorage.setItem('jwt_token', res.token
        );
      }       
      // Se guardan los datos del jugador logueado en el UserContext.
      loginUsuario(res.jugador);

      // Para que acepte las notificaciones.
      if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
      }

      console.log("Agente registrado con éxito. Redirigiendo al Home...");
      navigate("/home");

    } catch (error) {
      console.error("Fallo de conexión:", error);

      if (error.message === "TAG_DUPLICADO") {
        setErrorMensaje("Este nombre en clave ya está asignado a otro agente. Elige otro.");
      } else {
        setErrorMensaje(error.message || "Error de comunicación con el servidor central");
      }
    } finally {
      setCargando(false);
    }
  };

  // ------ Interfaz gráfica ------
  return (
    <ScreenFrame title="NUEVO AGENTE DETECTADO">
      <div className="flex items-center justify-center min-h-[80vh]">
        <ManilaFolder className="w-full max-w-xl">
          <div className="p-5 sm:p-8 md:p-10">
            
            {/* Top: tape + seal */}
            <div className="flex items-start justify-between mb-5">
              <TapeStrip className="rotate-[-5deg] -mt-2 -ml-2" />
              <FBISeal size={60} />
            </div>

            {/* Red stripe header - Cambiamos el texto para adaptarlo al contexto */}
            <div className="relative mb-6">
              <div className="relative py-2 px-4">
                <h1 className="font-['Special_Elite',cursive] text-[#8b2020] tracking-[0.1em] sm:tracking-[0.15em] text-center" style={{ fontSize: 'clamp(18px, 3.5vw, 24px)' }}>
                  IDENTIFICACIÓN REQUERIDA
                </h1>
              </div>
            </div>

            {/* Formulario de Tag */}
            <form onSubmit={handleSubmit} className="max-w-xs mx-auto space-y-6 py-2">
              <div className="text-center space-y-2">
                <label className="block font-['Courier_Prime',monospace] text-[#3a3020] font-bold text-sm">
                  INTRODUZCA SU NOMBRE DE AGENTE
                </label>
                
                <input 
                  type="text" 
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Nombre"
                  maxLength={15}
                  disabled={cargando}
                  className="w-full bg-[#f4ebd8] border-2 border-[#a08050]/50 p-2 text-center font-['Courier_Prime',monospace] text-lg text-[#3a3020] focus:outline-none focus:border-[#8b2020] placeholder:text-[#a08050]/50 uppercase tracking-widest shadow-inner transition-colors"
                />
                
                {/* Mensaje de error dinámico */}
                {errorMensaje && (
                  <p className="font-['Courier_Prime',monospace] text-[#8b2020] text-xs font-bold mt-2 animate-pulse">
                    [ERROR]: {errorMensaje}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={cargando}
                className={`w-full bg-[#3a3020] text-[#f4ebd8] border-2 border-[#3a3020] py-2.5 flex items-center justify-center gap-3 rounded-sm hover:bg-[#2a2215] transition-colors shadow-md cursor-pointer font-['Courier_Prime',monospace] font-bold ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {cargando ? "PROCESANDO..." : "CONFIRMAR IDENTIDAD"}
              </button>
            </form>

            {/* Bottom stamps */}
            <div className="flex items-center justify-between mt-8 flex-wrap gap-2">
              <RedStamp text="PENDIENTE" className="rotate-[5deg]" />
              <span className="font-['Courier_Prime',monospace] text-[#403E3B]/50" style={{ fontSize: 8 }}>
                FORMULARIO: C-901 — DEPARTAMENTO DE REGISTRO
              </span>
            </div>
            
          </div>
        </ManilaFolder>
      </div>
    </ScreenFrame>
  );
}