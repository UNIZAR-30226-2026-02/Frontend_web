import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { Pantalla11Perfil } from '@/app/pantallas/Pantalla11Perfil';
import * as apiJugador from '@/app/api/apiJugador';
import * as apiTienda from '@/app/api/apiTienda';

vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn(),
  obtenerPersonalizaciones: vi.fn(),
}));

vi.mock('@/app/api/apiTienda', () => ({
  obtenerPersonalizacionesJugador: vi.fn(),
}));

describe('Pruebas del RF-3: Cerrar sesión', () => {
  const mockUserContext = {
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe cerrar la sesión correctamente al pulsar el botón', async () => {
    apiJugador.obtenerPerfil.mockResolvedValue({ tag: 'Agente007', foto_perfil: '1', balas: 100 });
    apiTienda.obtenerPersonalizacionesJugador.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla11Perfil />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await screen.findAllByText(/Agente007/i);

    const logoutBtn = screen.getByText(/CERRAR SESIÓN/i);
    fireEvent.click(logoutBtn);

    expect(mockUserContext.logout).toHaveBeenCalled();
  });
});
