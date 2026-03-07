import { RouterProvider } from "react-router";
import { router } from "./routes";
import { UserProvider } from "./components/UserContext";

export default function App() {
  return (
    // Utiliza el contexto del usuario loggeado.
    <UserProvider>  
      <RouterProvider router={router} />
    </UserProvider>
  );
}
