import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { PantallaPartida } from '@/app/pantallas/Pantalla14Partida'; // ✅ nombre correcto

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

describe('Pruebas del RF-16: Asignación de roles', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { playClick: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('jwt_token', 'mock-token');
  });

  it('Debe cargar el rol del jugador al entrar en la partida', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/participantes/rol')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ rol: 'agente', equipo: 'rojo' })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(
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

    await waitFor(() => {
      expect(screen.getByText(/Eres/i)).toBeInTheDocument();
      expect(screen.getByText(/Agente de Campo/i)).toBeInTheDocument();
      expect(screen.getByText(/Rojo/i)).toBeInTheDocument();
    });
  });
});