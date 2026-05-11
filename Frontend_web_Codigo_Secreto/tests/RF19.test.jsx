import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { PantallaPartida } from '@/app/pantallas/Pantalla14Partida';

const mockStompClient = {
  connect: vi.fn(),
  subscribe: vi.fn(),
  publish: vi.fn(),
  activate: vi.fn(),
  deactivate: vi.fn(),
  connected: true,
};

vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn(() => mockStompClient),
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

describe('Pruebas del RF-19: Introducir pista por el Jefe', () => {
  const mockUser = { id_google: '123', tag: 'JefeTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { playClick: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('jwt_token', 'mock-token');
  });

  it('El Jefe de Espías debe poder enviar una pista por WebSocket', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/participantes/rol')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ rol: 'lider', equipo: 'rojo' }),
        });
      }
      if (url.includes('/estado')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            estado: 'en_curso',
            equipo_turno_actual: 'rojo',      // coincide con el equipo del jefe
            fase_turno: 'esperando_pista',    // fase que habilita el formulario de pista
            cartas_rojas_restantes: 9,
            cartas_azules_restantes: 8,
            pista_actual: null,
            tablero: { cartas: [] },
            votos_turno_actual: [],
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

    // Esperar a que el rol y el estado del turno se hayan cargado
    await screen.findByText(/Jefe de Espías/i);
    await waitFor(() => {
      expect(screen.getByText(/TURNO ROJO/i)).toBeInTheDocument();
    });

    // 1. Escribir la palabra clave
    const inputPista = screen.getByPlaceholderText(/ej: NOCTURNO/i);
    fireEvent.change(inputPista, { target: { value: 'ARMAS' } });

    // 2. Seleccionar el número de cartas (botón con el número 2)
    const botonNumero = screen.getByRole('button', { name: '2' });
    fireEvent.click(botonNumero);

    // 3. Hacer clic en "ENVIAR PISTA"
    const enviarBtn = screen.getByRole('button', { name: /enviar pista/i });
    fireEvent.click(enviarBtn);

    // 4. Verificar que se publica el mensaje STOMP correcto
    await waitFor(() => {
      expect(mockStompClient.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: expect.stringContaining('/pista'),
          body: expect.any(String),
        })
      );

      const llamada = mockStompClient.publish.mock.calls[0][0];
      const body = JSON.parse(llamada.body);
      expect(body).toMatchObject({
        palabra_pista: 'ARMAS',
        pista_numero: 2,
      });
    });
  });
});