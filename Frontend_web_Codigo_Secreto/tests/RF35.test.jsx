import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { PantallaPartida } from '@/app/pantallas/Pantalla14Partida';
import * as apiPartidas from '@/app/api/apiPartidas';

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

vi.mock('@/app/api/apiPartidas', () => ({
  abandonarPartida: vi.fn(),
}));

vi.mock('sockjs-client', () => ({ default: vi.fn() }));
vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn().mockResolvedValue({ marco_carta_equipado: '#d4af37', fondo_tablero_equipado: '#967c26' }),
  obtenerPersonalizaciones: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/app/hooks/useSound', () => ({
  useSound: () => ({ playClick: vi.fn(), playCancelar: vi.fn() }),
}));

describe('Pruebas del RF-35: Abandono de partida y penalización', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { playClick: vi.fn(), playCancelar: vi.fn() };

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
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });
  });

  it('Debe llamar a la API de abandonar tras confirmación del usuario', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    apiPartidas.abandonarPartida.mockResolvedValue(true);

    render(
      <MemoryRouter initialEntries={['/partida/123']}>
        <UserContext.Provider value={mockUserContext}>
          <SoundContext.Provider value={mockSoundContext}>
            <Routes>
              <Route path="/partida/:id_partida" element={<PantallaPartida />} />
            </Routes>
          </SoundContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    );

    await screen.findByText(/Agente de Campo/i);

    const abortBtn = screen.getByText(/ABORTAR MISIÓN/i);
    fireEvent.click(abortBtn);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(apiPartidas.abandonarPartida).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });
});
