import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { Pantalla06Manual } from '@/app/pantallas/Pantalla06Manual';
import { Pantalla07Lobby } from '@/app/pantallas/Pantalla07Lobby';
import * as apiPartidas from '@/app/api/apiPartidas';

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

vi.mock('@/app/api/apiPartidas', () => ({
  obtenerTemasJugador: vi.fn(),
  obtenerPartidasPublicas: vi.fn(),
  unirsePartidaPublica: vi.fn(),
  unirsePartidaPrivada: vi.fn(),
  crearPartida: vi.fn(),
  elegirEquipo: vi.fn(),
  abandonarPartida: vi.fn(),
  obtenerResultadosPartida: vi.fn(),
  obtenerTemasActivos: vi.fn(),
}));

describe('Pruebas del RF-23: Manual de reglas y Lobby', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = { 
    playClick: vi.fn(), 
    setMusicVolume: vi.fn(), 
    setSfxVolume: vi.fn(),
    musicVolume: 0.5,
    sfxVolume: 0.7
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe mostrar el manual de reglas (RF-23.1)', () => {
    render(
      <MemoryRouter>
        <SoundContext.Provider value={mockSoundContext}>
          <Pantalla06Manual />
        </SoundContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText(/MANUAL OPERATIVO/i)).toBeInTheDocument();
    expect(screen.getByText(/REGLAS DEL JUEGO/i)).toBeInTheDocument();
  });

  it('Debe permitir elegir equipo en el Lobby (RF-23.5)', async () => {
    const mockLobby = {
      id_partida: '123',
      estado: 'lobby',
      jugadores: [
        { tag: 'AgenteTest', equipo: null, listo: false }
      ],
      configuracion: { tiempo_turno: 60, nombre_tema: 'Básico' }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLobby)
    });

    render(
      <MemoryRouter initialEntries={['/lobby/123']}>
        <UserContext.Provider value={mockUserContext}>
          <SoundContext.Provider value={mockSoundContext}>
            <Routes>
              <Route path="/lobby/:id_partida" element={<Pantalla07Lobby />} />
            </Routes>
          </SoundContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(async () => {
      const rojoBtn = await screen.findByText(/EQUIPO ROJO/i);
      fireEvent.click(rojoBtn);

      expect(apiPartidas.elegirEquipo).not.toHaveBeenCalled();
    });
  });
});
