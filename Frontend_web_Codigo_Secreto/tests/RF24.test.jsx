import { Pantalla15FinPartida } from '@/app/pantallas/Pantalla15FinPartida';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { PantallaPartida } from '@/app/pantallas/Pantalla14Partida';

// Mock de STOMP Client
const mockStompClient = {
  subscribe: vi.fn(),
  publish: vi.fn(),
  activate: vi.fn(),
  deactivate: vi.fn(),
  connected: true,
};

vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn((options) => {
    mockStompClient.activate = vi.fn(() => {
      if (options.onConnect) options.onConnect();
    });
    return mockStompClient;
  }),
}));

vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn().mockResolvedValue({ marco_carta_equipado: '#d4af37', fondo_tablero_equipado: '#967c26' }),
  obtenerPersonalizaciones: vi.fn().mockResolvedValue([]),
}));

vi.mock('sockjs-client', () => ({ default: vi.fn() }));

vi.mock('@/app/hooks/useSound', () => ({
  useSound: () => ({ playClick: vi.fn(), playAplauso: vi.fn() }),
}));

describe('Pruebas del RF-24: Condiciones de victoria y derrota', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { playClick: vi.fn(), playAplauso: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('jwt_token', 'mock-token');
    
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/participantes/rol')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ rol: 'agente', equipo: 'rojo', equipo_inicial: 'rojo' }) });
      }
      if (url.includes('/estado')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({
          tablero: { cartas: [] },
          equipo_turno_actual: 'rojo',
          fase_turno: 'esperando_pista',
          cartas_rojas_restantes: 9,
          cartas_azules_restantes: 8,
          estado: 'jugando'
        }) });
      }
      if (url.includes('/fin')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({
          equipo_ganador: 'rojo',
          aciertos_rojo: 10,
          aciertos_azul: 5
        }) });
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });
  });

  it('Debe redirigir a la pantalla final cuando un equipo gana', async () => {
    const mockEstadoFinal = {
      tablero: { cartas: [] },
      ganador: 'Rojo',
      estado: 'finalizada',
      estadisticas_finales: { balas_ganadas: 100 }
    };

    render(
      <MemoryRouter initialEntries={['/partida/123']}>
        <UserContext.Provider value={mockUserContext}>
          <SoundContext.Provider value={mockSoundContext}>
            <Routes>
              <Route path="/partida/:id_partida" element={<PantallaPartida />} />
              <Route path="/fin-partida/:id_partida" element={<Pantalla15FinPartida />} /> 
            </Routes>
          </SoundContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockStompClient.subscribe).toHaveBeenCalled();
    });

    const estadoSubscription = mockStompClient.subscribe.mock.calls.find(call => call[0].includes('/estado'));
    if (estadoSubscription) {
      const callback = estadoSubscription[1];
      callback({ body: JSON.stringify(mockEstadoFinal) });
    }

    await waitFor(() => {
      expect(screen.getByText(/INFORME DE CLASIFICACIÓN FINAL/i)).toBeInTheDocument();
      expect(screen.getByText(/MISION CUMPLIDA/i)).toBeInTheDocument();
    });
  });
});
