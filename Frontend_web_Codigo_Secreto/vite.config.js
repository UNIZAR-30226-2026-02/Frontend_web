import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url' // <-- Añadimos esto
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// Recreamos __dirname para el sistema de módulos de JavaScript moderno
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    // Los plugins de React y Tailwind son necesarios
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Usamos el alias '@' para apuntar al directorio src
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Archivos extra que Vite debe procesar
  assetsInclude: ['**/*.svg', '**/*.csv'],
  test: {
    environment: 'jsdom', // Fundamental para que React Testing Library funcione
    globals: true,        // Para no tener que importar 'describe' o 'it' en cada archivo
    setupFiles: './tests/setupTests.js', // Ruta al archivo de configuración
  }
})

