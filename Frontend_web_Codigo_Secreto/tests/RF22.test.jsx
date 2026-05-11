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
vi.mock('sockjs-client', () => ({ default: vi.fn() }));
vi.mock('@/app/hooks/useSound', () => ({
  useSound: () => ({ playClick: vi.fn(), playAceptar: vi.fn(), playDisparo: vi.fn(), playFiasco: vi.fn() }),
}));
vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn().mockResolvedValue({ marco_carta_equipado: '#d4af37', fondo_tablero_equipado: '#967c26' }),
  obtenerPersonalizaciones: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/app/api/apiPartidas', () => ({
  abandonarPartida: vi.fn(),
}));

describe('Pruebas del RF-22: Revelación de cartas y pérdida de turno', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { playClick: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('jwt_token', 'mock-token');
    Object.keys(subscriptions).forEach(key => delete subscriptions[key]);
    mockPublish = vi.fn();
  });

  it('Debe mostrar la carta revelada y cambiar de turno si es un fallo', async () => {
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
            fase_turno: 'votando',                 // fase en la que el agente vota y luego se revela la carta
            pista_actual: { palabra_pista: 'FUEGO', pista_numero: 2 },
            cartas_rojas_restantes: 9,
            cartas_azules_restantes: 8,
            tablero: {
              cartas: [
                { id_carta_tablero: 1, palabra: 'https://ejemplo.com/sol.png', tipo: null, estado: 'oculta' }
              ]
            },
            votos_turno_actual: []
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
    expect(await screen.findByText(/FUEGO/i)).toBeInTheDocument();

    // Verificar que se suscribió al topic de estado
    const estadoCallbacks = Object.keys(subscriptions)
      .filter(t => t.includes('/user/queue/partidas/') && t.includes('/estado'));
    expect(estadoCallbacks.length).toBe(1);
    const estadoTopic = estadoCallbacks[0];

    // Simular la revelación de la carta (fallo del agente) enviando un mensaje al callback de estado
    const mockEstadoRevelado = {
      estado: 'en_curso',
      equipo_turno_actual: 'azul',
      fase_turno: 'esperando_pista',
      pista_actual: null,
      cartas_rojas_restantes: 9,
      cartas_azules_restantes: 7,
      tablero: {
        cartas: [
          { id_carta_tablero: 1, palabra: 'https://ejemplo.com/sol.png', tipo: 'azul', estado: 'revelada' }
        ]
      },
      votos_turno_actual: []
    };
    subscriptions[estadoTopic]({ body: JSON.stringify(mockEstadoRevelado) });

    // Debería mostrar "TURNO AZUL"
    expect(await screen.findByText(/TURNO AZUL/i)).toBeInTheDocument();
  });
});