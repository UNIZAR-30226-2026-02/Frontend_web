import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { PantallaPartida } from '@/app/pantallas/Pantalla14Partida';

const subscriptions = {};
let mockPublish = vi.fn();

vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn().mockImplementation((config) => {
    const client = {
      subscribe: vi.fn((topic, callback) => {
        subscriptions[topic] = callback;
        return { unsubscribe: vi.fn() };
      }),
      publish: mockPublish,
      activate: vi.fn(() => {
        if (config.onConnect) config.onConnect();
      }),
      deactivate: vi.fn(),
      connected: true,
    };
    return client;
  }),
}));
vi.mock('sockjs-client', () => ({ default: vi.fn() }));
vi.mock('@/app/hooks/useSound', () => ({
  useSound: () => ({ playClick: vi.fn(), playAceptar: vi.fn(), playDisparo: vi.fn() }),
}));
vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn().mockResolvedValue({}),
  obtenerPersonalizaciones: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/app/api/apiPartidas', () => ({
  abandonarPartida: vi.fn(),
}));

describe('Pruebas del RF-20: Votar cartas por los Agentes (incluye RF-21)', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { playClick: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('jwt_token', 'mock-token');
    Object.keys(subscriptions).forEach(key => delete subscriptions[key]);
    mockPublish = vi.fn();
  });

  it('El Agente de Campo debe poder votar por una carta y ver votos en tiempo real', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/participantes/rol')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ rol: 'agente', equipo: 'azul' }),
        });
      }
      if (url.includes('/estado')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            estado: 'en_curso',
            equipo_turno_actual: 'azul',
            fase_turno: 'votando',
            pista_actual: { palabra_pista: 'CALOR', pista_numero: 1 },
            cartas_rojas_restantes: 8,
            cartas_azules_restantes: 9,
            tablero: {
              cartas: [
                { id_carta_tablero: 1, palabra: 'https://ejemplo.com/sol.png', tipo: null, estado: 'oculta' }
              ]
            },
            votos_turno_actual: [{ id_carta_tablero: 1, votos: ['OtroAgente'], total: 1 }]
          }),
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

    // Verificar que se muestra la pista y los votos
    expect(await screen.findByText(/CALOR/i)).toBeInTheDocument();
    expect(screen.getByText(/VOTOS ACTUALES:\s*1\/1/)).toBeInTheDocument();

    // Seleccionar la carta con doble clic rápido
    const carta = screen.getByAltText(/ejemplo.com\/sol.png/i);
    fireEvent.click(carta);
    fireEvent.click(carta); // El segundo clic se produce inmediatamente (doble clic)

    // Ahora el botón de votar debería estar habilitado
    const votarBtn = screen.getByText(/VOTAR CARTA/i);
    expect(votarBtn).not.toBeDisabled();

    fireEvent.click(votarBtn);

    // Verificar que se publicó el voto por WebSocket
    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: expect.stringContaining('/votar'),
          body: expect.any(String),
        })
      );
      const body = JSON.parse(mockPublish.mock.calls[0][0].body);
      expect(body.id_carta_tablero).toBe(1);
    });
  });
});