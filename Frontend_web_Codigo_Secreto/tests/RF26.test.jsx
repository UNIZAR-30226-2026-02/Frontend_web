import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

vi.mock('sockjs-client', () => ({ default: vi.fn() }));
vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn().mockResolvedValue({ marco_carta_equipado: '#d4af37', fondo_tablero_equipado: '#967c26' }),
  obtenerPersonalizaciones: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/app/hooks/useSound', () => ({
  useSound: () => ({ playClick: vi.fn(), playWhoosh: vi.fn() }),
}));

describe('Pruebas del RF-26: Chat exclusivo de equipo (incluye RF-27)', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { playClick: vi.fn(), playWhoosh: vi.fn() };

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

  it('Debe enviar mensajes por el chat del equipo y recibirlos', async () => {
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

    const chatInput = screen.getByPlaceholderText(/Escribe mensaje/i);
    fireEvent.change(chatInput, { target: { value: 'Creo que es la carta SOL' } });
    fireEvent.keyDown(chatInput, { key: 'Enter', code: 'Enter' });

    // RF-27: Verificación de que el mensaje se publica en el destino correcto
    expect(mockStompClient.publish).toHaveBeenCalledWith(expect.objectContaining({
      destination: expect.stringContaining('/chat'),
      body: JSON.stringify({ mensaje: 'Creo que es la carta SOL' })
    }));

    // Simular recepción de mensaje
    const chatCallback = mockStompClient.subscribe.mock.calls.find(call => call[0].includes('chat'))[1];
    chatCallback({ 
      body: JSON.stringify({ 
        tag: 'OtroAgente', 
        mensaje: 'Afirmativo', 
        es_valido: true 
      }) 
    });

    expect(await screen.findByText(/OtroAgente/i)).toBeInTheDocument();
    expect(screen.getByText(/Afirmativo/i)).toBeInTheDocument();
  });
});
