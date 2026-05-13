import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App.jsx'
import { ToastProvider } from './app/context/ToastContext.jsx'
import { SoundProvider } from './app/context/SoundContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SoundProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </SoundProvider>
  </StrictMode>,
)