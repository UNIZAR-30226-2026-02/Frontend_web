import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { Pantalla11Perfil } from '@/app/pantallas/Pantalla11Perfil';
import * as apiJugador from '@/app/api/apiJugador';
import * as apiTienda from '@/app/api/apiTienda';

vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn(),
  actualizarPerfil: vi.fn(),
  obtenerPersonalizaciones: vi.fn(),
  obtenerRanking: vi.fn(),
  obtenerEstadisticas: vi.fn(),
  obtenerLogros: vi.fn(),
  obtenerHistorial: vi.fn(),
}));

vi.mock('@/app/api/apiTienda', () => ({
  obtenerPersonalizacionesJugador: vi.fn(),
}));

describe('Pruebas del RF-6: Modificación de tag y perfil', () => {
  const mockUserContext = {
    setUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe permitir cambiar el tag del usuario', async () => {
    apiJugador.obtenerPerfil.mockResolvedValue({
      tag: 'Agente007',
      foto_perfil: '1',
      balas: 100,
      partidas_jugadas: 10,
      victorias: 5,
      num_aciertos: 50,
      num_fallos: 10
    });
    apiTienda.obtenerPersonalizacionesJugador.mockResolvedValue([]);
    apiJugador.actualizarPerfil.mockResolvedValue({ tag: 'SuperAgente', foto_perfil: '1' });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla11Perfil />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await screen.findAllByText(/Agente007/i);

    const editBtns = screen.getAllByRole('button');
    // 0: Volver, 1: Polaroid, 2: Editar Tag
    fireEvent.click(editBtns[2]);

    const input = await screen.findByDisplayValue('Agente007');
    fireEvent.change(input, { target: { value: 'SuperAgente' } });
    
    // Confirmar cambio (botón con icono Check)
    const emptyButtons = await screen.findAllByRole('button', { name: '' });
    const confirmBtn = emptyButtons.find(btn => btn.querySelector('.lucide-check'));
    fireEvent.click(confirmBtn);

    await waitFor(() => {
    expect(apiJugador.actualizarPerfil).toHaveBeenCalledWith({ tag: 'SuperAgente' });
    expect(screen.getByRole('heading', { name: /SuperAgente/i })).toBeInTheDocument();
});
  });

  it('Debe permitir cambiar la imagen de perfil', async () => {
    apiJugador.obtenerPerfil.mockResolvedValue({
      tag: 'Agente007',
      foto_perfil: '1',
      balas: 100
    });
    apiTienda.obtenerPersonalizacionesJugador.mockResolvedValue([]);
    apiJugador.actualizarPerfil.mockResolvedValue({ tag: 'Agente007', foto_perfil: '2' });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla11Perfil />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await screen.findAllByText(/Agente007/i);

    const polaroid = screen.getByTitle(/Cambiar fotografía/i);
    fireEvent.click(polaroid);

    const avatar2 = screen.getByAltText(/Agente 2/i);
    fireEvent.click(avatar2);

    await waitFor(() => {
      expect(apiJugador.actualizarPerfil).toHaveBeenCalledWith({ foto_perfil: '2' });
      expect(mockUserContext.setUser).toHaveBeenCalled();
    });
  });
});
