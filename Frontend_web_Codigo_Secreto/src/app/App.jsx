import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { UserProvider } from "./components/UserContext";
import { useSessionGuard } from "./hooks/useSessionGuard";

function AppContent() {
  // Hook que escucha invalidación de sesión desde otro dispositivo
  useSessionGuard();

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    // Utiliza el contexto del usuario loggeado.
    <UserProvider>  
      <AppContent />
    </UserProvider>
  );
}
