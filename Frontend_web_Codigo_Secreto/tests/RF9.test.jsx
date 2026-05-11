import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { Pantalla13Tienda } from '@/app/pantallas/Pantalla13Tienda';
import * as apiJugador from '@/app/api/apiJugador';
import * as apiTienda from '@/app/api/apiTienda';

vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn(),
  actualizarPerfil: vi.fn(),
  obtenerRanking: vi.fn(),
  obtenerEstadisticas: vi.fn(),
  obtenerLogros: vi.fn(),
  obtenerHistorial: vi.fn(),
}));

vi.mock('@/app/api/apiTienda', () => ({
  obtenerTemasActivos: vi.fn(),
  obtenerPersonalizacionesJugador: vi.fn(),
  comprarTema: vi.fn(),
  comprarPersonalizacion: vi.fn(),
  equiparPersonalizacion: vi.fn(),
}));

describe('Pruebas del RF-9: Tienda - Compra de temas/paquetes', () => {
  const mockUserContext = {
    loginUsuario: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe permitir comprar un paquete de cartas si se tienen balas suficientes', async () => {
    apiJugador.obtenerPerfil.mockResolvedValue({ balas: 1000 });
    apiTienda.obtenerTemasActivos.mockResolvedValue([
      { id_tema: 1, nombre: 'Magia', descripcion: 'Mundo de fantasía', precio_balas: 500, comprado: false }
    ]);
    apiTienda.obtenerPersonalizacionesJugador.mockResolvedValue([]);
    apiTienda.comprarTema.mockResolvedValue({ balas: 500 });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla13Tienda />
        </UserContext.Provider>
      </MemoryRouter>
    );

    // Esperar a que cargue el contenido (más tiempo por si acaso)
    await screen.findByText(/MAGIA/i, {}, { timeout: 5000 });
    expect(screen.getByText(/1[.,]?000/)).toBeInTheDocument();

    const buyBtn = screen.getByRole('button', { name: /ADQUIRIR/i });
    fireEvent.click(buyBtn);

    const confirmBtn = await screen.findByRole('button', { name: /CONFIRMAR/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(apiTienda.comprarTema).toHaveBeenCalledWith(1);
      // El saldo restante debería ser 500
      expect(screen.getAllByText(/500/)).toHaveLength(2); // Uno es el precio, otro el saldo
      expect(screen.getByText(/Magia adquirido/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('No debe permitir comprar si no hay balas suficientes', async () => {
    apiJugador.obtenerPerfil.mockResolvedValue({ balas: 100 });
    apiTienda.obtenerTemasActivos.mockResolvedValue([
      { id_tema: 1, nombre: 'Cyberpunk', descripcion: 'Futuro distópico', precio_balas: 500, comprado: false }
    ]);
    apiTienda.obtenerPersonalizacionesJugador.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla13Tienda />
        </UserContext.Provider>
      </MemoryRouter>
    );

    await screen.findByText(/CYBERPUNK/i, {}, { timeout: 5000 });

    const buyBtn = screen.getByRole('button', { name: /ADQUIRIR/i });
    fireEvent.click(buyBtn);

    const confirmBtn = await screen.findByRole('button', { name: /CONFIRMAR/i });
    expect(confirmBtn).toBeDisabled();
    expect(screen.getByText(/No tienes suficientes balas/i)).toBeInTheDocument();
  });
});
