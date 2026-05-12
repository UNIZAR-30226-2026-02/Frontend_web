import { createBrowserRouter } from "react-router-dom";

import { Layout } from "./components/Layout";
import { Pantalla00Carga } from "./pantallas/Pantalla00Carga";
import { Pantalla01Login } from "./pantallas/Pantalla01Login";
import { Pantalla02Home } from "./pantallas/Pantalla02Home";
import { Pantalla03MisionesPublicas } from "./pantallas/Pantalla03MisionesPublicas";
import { Pantalla05NombreUsuarioNuevo } from "./pantallas/Pantalla05NombreUsuarioNuevo";
import { Pantalla06Manual } from "./pantallas/Pantalla06Manual";
import { Pantalla07Lobby } from "./pantallas/Pantalla07Lobby";
import { Pantalla08Social } from "./pantallas/Pantalla08Social";
import { Pantalla10Logros } from "./pantallas/Pantalla10Logros";
import { Pantalla11Perfil } from "./pantallas/Pantalla11Perfil";
import { Pantalla12CrearPartida } from "./pantallas/Pantalla12CrearPartida";
import { Pantalla13Tienda } from "./pantallas/Pantalla13Tienda";
import { PantallaPartida } from "./pantallas/Pantalla14Partida";
import { Pantalla15FinPartida } from "./pantallas/Pantalla15FinPartida";
import { Pantalla16Historial } from "./pantallas/Pantalla16Historial";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// Componente para proteger rutas que requieren autenticación
function AuthGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Pantalla00Carga },
      { path: "login", Component: Pantalla01Login },
      { 
        path: "home", 
        element: <AuthGuard><Pantalla02Home /></AuthGuard> 
      },
      { 
        path: "misiones-publicas", 
        element: <AuthGuard><Pantalla03MisionesPublicas /></AuthGuard> 
      },
      { path: "manual", Component: Pantalla06Manual },
      { 
        path: "lobby/:id_partida", 
        element: <AuthGuard><Pantalla07Lobby /></AuthGuard> 
      },
      { 
        path: "social", 
        element: <AuthGuard><Pantalla08Social /></AuthGuard> 
      },
      { 
        path: "nombre-usuario-nuevo", 
        element: <AuthGuard><Pantalla05NombreUsuarioNuevo /></AuthGuard> 
      },
      { 
        path: "logros", 
        element: <AuthGuard><Pantalla10Logros /></AuthGuard> 
      },
      { 
        path: "perfil", 
        element: <AuthGuard><Pantalla11Perfil /></AuthGuard> 
      },
      { 
        path: "crear-mision", 
        element: <AuthGuard><Pantalla12CrearPartida /></AuthGuard> 
      },
      { 
        path: "tienda", 
        element: <AuthGuard><Pantalla13Tienda /></AuthGuard> 
      },
      { 
        path: "partida/:id_partida", 
        element: <AuthGuard><PantallaPartida /></AuthGuard> 
      },
      { 
        path: "fin-partida/:id_partida", 
        element: <AuthGuard><Pantalla15FinPartida /></AuthGuard> 
      },
      { 
        path: "historial", 
        element: <AuthGuard><Pantalla16Historial /></AuthGuard> 
      },
    ],
  },
]);
