import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
vi.mock('sockjs-client', () => ({ default: vi.fn() })); // debe estar antes de los mocks que usan STOMP Client
vi.mock('@/app/hooks/useSound', () => ({
  useSound: () => ({ playClick: vi.fn(), playAceptar: vi.fn(), playDisparo: vi.fn() }),
}));
vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn().mockResolvedValue({ marco_carta_equipado: null, fondo_tablero_equipado: null }),
  obtenerPersonalizaciones: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/app/api/apiPartidas', () => ({
  abandonarPartida: vi.fn(),
}));

describe('Pruebas del RF-34: Temporizadores de turno', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { playClick: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('jwt_token', 'mock-token');
    Object.keys(subscriptions).forEach(key => delete subscriptions[key]);
    mockPublish = vi.fn();
  });

  it('Debe mostrar el tiempo restante del turno actual', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/participantes/rol')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ rol: 'agente', equipo: 'rojo', equipo_inicial: 'rojo' }),
        });
      }
      if (url.includes('/estado')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            estado: 'en_curso',
            equipo_turno_actual: 'rojo',
            fase_turno: 'votando',
            pista_actual: { palabra_pista: 'TIEMPO', pista_numero: 1 },
            cartas_rojas_restantes: 9,
            cartas_azules_restantes: 8,
            tablero: { cartas: [] },
            votos_turno_actual: [],
          }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

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

    // Esperar a que el estado inicial se haya cargado y muestre el turno actual
    expect(await screen.findByText(/TIEMPO/i)).toBeInTheDocument();

    // Verificar que se ha suscrito al topic de temporizador
    const timerTopic = Object.keys(subscriptions).find(t => t.includes('temporizador'));
    expect(timerTopic).toBeTruthy();
    subscriptions[timerTopic]({ body: JSON.stringify({ segundos_restantes: 45 }) });

    // El texto del temporizador debería actualizarse con el nuevo tiempo (45)
    expect(await screen.findByText(/45/)).toBeInTheDocument();
  });
});