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

describe('Pruebas del RF-4: Desactivar cuenta', () => {
  const mockUserContext = {
    desactivarCuenta: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe permitir desactivar la cuenta tras confirmación del usuario', async () => {
    apiJugador.obtenerPerfil.mockResolvedValue({ tag: 'Agente007', foto_perfil: '1', balas: 100 });
    apiTienda.obtenerPersonalizacionesJugador.mockResolvedValue([]);
    
    // Mock de window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla11Perfil />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await screen.findAllByText(/Agente007/i);

    const deactivateBtn = screen.getByText(/DESACTIVAR CUENTA/i);
    fireEvent.click(deactivateBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockUserContext.desactivarCuenta).toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('No debe desactivar la cuenta si el usuario cancela la confirmación', async () => {
    apiJugador.obtenerPerfil.mockResolvedValue({ tag: 'Agente007', foto_perfil: '1', balas: 100 });
    apiTienda.obtenerPersonalizacionesJugador.mockResolvedValue([]);
    
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla11Perfil />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await screen.findAllByText(/Agente007/i);

    const deactivateBtn = screen.getByText(/DESACTIVAR CUENTA/i);
    fireEvent.click(deactivateBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockUserContext.desactivarCuenta).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });
});
