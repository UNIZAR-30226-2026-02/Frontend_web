import { createBrowserRouter } from "react-router";

import { Layout } from "./components/Layout";
import { Pantalla01Login } from "./components/Pantalla01Login";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Pantalla01Login },
      { path: "login", Component: Pantalla01Login },
    ],
  },
]);
