import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { Pantalla13Tienda } from '@/app/pantallas/Pantalla13Tienda';
import * as apiJugador from '@/app/api/apiJugador';
import * as apiTienda from '@/app/api/apiTienda';

vi.mock('@/app/api/apiJugador', () => ({
  obtenerRanking: vi.fn(),
  obtenerPerfil: vi.fn(),
  actualizarPerfil: vi.fn(),
  obtenerPersonalizaciones: vi.fn(),
  obtenerEstadisticas: vi.fn(),
  obtenerLogros: vi.fn(),
  obtenerHistorial: vi.fn(),
}));

vi.mock('@/app/api/apiTienda', () => ({
  obtenerTemasActivos: vi.fn(),
  obtenerPersonalizacionesJugador: vi.fn(),
  equiparPersonalizacion: vi.fn(),
}));

describe('Pruebas del RF-10: Tienda - Equipar personalización', () => {
  const mockUserContext = {
    loginUsuario: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe permitir equipar un marco de carta ya comprado', async () => {
    apiJugador.obtenerPerfil.mockResolvedValue({ balas: 100, marco_carta_equipado: null });
    apiTienda.obtenerTemasActivos.mockResolvedValue([]);
    apiTienda.obtenerPersonalizacionesJugador.mockResolvedValue([
      { id_personalizacion: 10, nombre: 'Oro Envejecido', tipo: 'carta', valor_visual: 'd4af37', comprado: true, equipado: false }
    ]);
    apiTienda.equiparPersonalizacion.mockResolvedValue({ id_personalizacion: 10, equipado: true });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla13Tienda />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await screen.findByText(/ORO ENVEJECIDO/i);

    const equipBtn = screen.getByRole('button', { name: /EQUIPAR/i });
    fireEvent.click(equipBtn);

    await waitFor(() => {
      expect(apiTienda.equiparPersonalizacion).toHaveBeenCalledWith(10, true);
      // Buscamos el span exacto que dice EQUIPADO
      expect(screen.getByText('EQUIPADO')).toBeInTheDocument();
    });
  });
});
