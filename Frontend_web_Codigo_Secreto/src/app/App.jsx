import { RouterProvider } from "react-router";
import { router } from "./routes";

// Este fichero únicamente contiene la inicialización del router utlizado por la aplicación. 

export default function App() {
  return <RouterProvider router={router} />;
}
