import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { PantallaPartida } from '@/app/pantallas/Pantalla14Partida';

// Mocks
vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn(() => ({
    connect: vi.fn(),
    subscribe: vi.fn(),
    publish: vi.fn(),
    activate: vi.fn(),
    deactivate: vi.fn(),
    connected: true,
  })),
}));
vi.mock('sockjs-client', () => ({ default: vi.fn() }));
vi.mock('@/app/hooks/useSound', () => ({
  useSound: () => ({ playClick: vi.fn(), playAceptar: vi.fn() }),
}));
vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn().mockResolvedValue({}),
  obtenerPersonalizaciones: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/app/api/apiPartidas', () => ({
  abandonarPartida: vi.fn(),
}));

describe('Pruebas del RF-18: Vistas de Jefe y Agente', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { playClick: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('jwt_token', 'mock-token');
  });

  function renderWithRouter(rol, equipo) {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/participantes/rol')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ rol, equipo }),
        });
      }
      // Simula el estado inicial del juego para que el Jefe vea el panel de pista
      if (url.includes('/estado')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            estado: "en_curso",
            equipo_turno_actual: equipo,     // turno del equipo del usuario
            fase_turno: "esperando_pista",   // fase en la que el jefe puede escribir pista
            cartas_rojas_restantes: 8,
            cartas_azules_restantes: 9,
            pista_actual: null,
            tablero: { cartas: [] },
            votos_turno_actual: [],
          }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    return render(
      <MemoryRouter initialEntries={['/partida/123']}>
        <Routes>
          <Route path="/partida/:id_partida" element={
            <UserContext.Provider value={mockUserContext}>
              <SoundContext.Provider value={mockSoundContext}>
                <PantallaPartida />
              </SoundContext.Provider>
            </UserContext.Provider>
          } />
        </Routes>
      </MemoryRouter>
    );
  }

  it('Debe mostrar la interfaz de Jefe de Espías correctamente', async () => {
    renderWithRouter('lider', 'azul');

    await waitFor(() => {
      expect(screen.getByText(/Jefe de Espías/i)).toBeInTheDocument();
      // El placeholder del input de la pista (campo específico del Jefe)
      expect(screen.getByPlaceholderText(/ej: NOCTURNO/i)).toBeInTheDocument();
    });
  });

  it('Debe mostrar la interfaz de Agente de Campo correctamente', async () => {
    renderWithRouter('agente', 'rojo');

    await waitFor(() => {
      expect(screen.getByText(/Agente de Campo/i)).toBeInTheDocument();
      // El campo de pista no debe existir para el agente
      expect(screen.queryByPlaceholderText(/ej: NOCTURNO/i)).not.toBeInTheDocument();
    });
  });
});