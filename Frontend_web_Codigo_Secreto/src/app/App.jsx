import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "./components/Layout"; // Ajusta la ruta según tu estructura
import { Pantalla01Login } from "./components/Pantalla01Login";
import { Pantalla02Home } from "./components/Pantalla02Home";
import { Pantalla03MisionesPublicas } from "./components/Pantalla03MisionesPublicas";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta padre que usa el Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Pantalla01Login />} />
          <Route path="/home" element={<Pantalla02Home />} />
          <Route path="/misiones-publicas" element={<Pantalla03MisionesPublicas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}