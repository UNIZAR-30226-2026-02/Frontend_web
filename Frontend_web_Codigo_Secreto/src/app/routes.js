import { createBrowserRouter } from "react-router";

import { Layout } from "./components/Layout";
import { Pantalla00Carga } from "./pantallas/Pantalla00Carga";
import { Pantalla01Login } from "./pantallas/Pantalla01Login";
import { Pantalla02Home } from "./pantallas/Pantalla02Home";
import { Pantalla03MisionesPublicas } from "./pantallas/Pantalla03MisionesPublicas";
import { Pantalla04PartidaAgente } from "./pantallas/Pantalla04PartidaAgente";
import { Pantalla05NombreUsuarioNuevo } from "./pantallas/Pantalla05NombreUsuarioNuevo";
import { Pantalla06Manual } from "./pantallas/Pantalla06Manual";
import { Pantalla07Lobby } from "./pantallas/Pantalla07Lobby";
import { Pantalla08Social } from "./pantallas/Pantalla08Social";
import { Pantalla09PartidaJefe } from "./pantallas/Pantalla09PartidaJefe";
import { Pantalla10Logros } from "./pantallas/Pantalla10Logros";
import { Pantalla11Perfil } from "./pantallas/Pantalla11Perfil";
import { Pantalla12CrearPartida } from "./pantallas/Pantalla12CrearPartida";
import { Pantalla13Tienda } from "./pantallas/Pantalla13Tienda";
import { PantallaPartida } from "./pantallas/Pantalla14Partida";
import { Pantalla15FinPartida } from "./pantallas/Pantalla15FinPartida";
import { Pantalla16Historial } from "./pantallas/Pantalla16Historial";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Pantalla00Carga },
      { path: "login", Component: Pantalla01Login },
      { path: "home", Component: Pantalla02Home },
      { path: "misiones-publicas", Component: Pantalla03MisionesPublicas },
      { path: "partida-agente", Component: Pantalla04PartidaAgente },
      { path: "manual", Component: Pantalla06Manual },
      { path: "lobby/:id_partida", Component: Pantalla07Lobby },
      { path: "social", Component: Pantalla08Social },
      { path: "partida-jefe", Component: Pantalla09PartidaJefe },
      { path: "nombre-usuario-nuevo", Component: Pantalla05NombreUsuarioNuevo },
      { path: "logros", Component: Pantalla10Logros},
      { path: "perfil", Component: Pantalla11Perfil },
      { path: "crear-mision", Component: Pantalla12CrearPartida },
      { path: "tienda", Component: Pantalla13Tienda },
      { path: "partida/:id_partida", Component: PantallaPartida },
      { path: "fin-partida/:id_partida", Component: Pantalla15FinPartida },
      { path: "historial", Component: Pantalla16Historial },
    ],
  },
]);
