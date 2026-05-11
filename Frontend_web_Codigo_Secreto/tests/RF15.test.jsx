import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { Pantalla03MisionesPublicas } from '@/app/pantallas/Pantalla03MisionesPublicas';
import * as apiPartidas from '@/app/api/apiPartidas';

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

describe('Pruebas del RF-15: Unirse a partida pública', () => {
  const mockUserContext = { user: { tag: 'AgenteTest' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe mostrar partidas públicas y permitir unirse a una', async () => {
    const mockPartidas = [
      { id_partida: 'pub-1', tag: 'Admin', jugadores_actuales: 2, max_jugadores: 8, nombre: 'Magia', tiempo_espera: 60 }
    ];
    const mockTemas = [{ id_tema: 1, nombre: 'Magia' }];
    
    apiPartidas.obtenerPartidasPublicas.mockResolvedValue(mockPartidas);
    apiPartidas.obtenerTemasJugador.mockResolvedValue(mockTemas);
    apiPartidas.unirsePartidaPublica.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla03MisionesPublicas />
        </UserContext.Provider>
      </MemoryRouter>
    );

    // El componente antepone "Partida de " al tag
    expect(await screen.findByText(/Partida de Admin/i)).toBeInTheDocument();

    const joinBtn = screen.getByText(/UNIRSE/i);
    fireEvent.click(joinBtn);

    await waitFor(() => {
      expect(apiPartidas.unirsePartidaPublica).toHaveBeenCalledWith('pub-1');
    });
  });
});
