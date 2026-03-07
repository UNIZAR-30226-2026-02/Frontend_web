import { createBrowserRouter } from "react-router";

import { Layout } from "./components/Layout";
import { Pantalla01Login } from "./pantallas/Pantalla01Login";
import { Pantalla02Home } from "./pantallas/Pantalla02Home";
import { Pantalla03MisionesPublicas } from "./pantallas/Pantalla03MisionesPublicas";
import { Pantalla04PartidaAgente } from "./pantallas/Pantalla04PartidaAgente";
import { Pantalla06Manual } from "./pantallas/Pantalla06Manual";
import { Pantalla07Lobby } from "./pantallas/Pantalla07Lobby";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Pantalla01Login },
      { path: "login", Component: Pantalla01Login },
      { path: "home", Component: Pantalla02Home },
      { path: "misiones-publicas", Component: Pantalla03MisionesPublicas },
      { path: "partida-agente", Component: Pantalla04PartidaAgente },
      { path: "manual", Component: Pantalla06Manual },
      { path: "lobby", Component: Pantalla07Lobby },
    ],
  },
]);
