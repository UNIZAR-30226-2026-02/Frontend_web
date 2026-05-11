import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { Pantalla08Social } from '@/app/pantallas/Pantalla08Social';
import * as apiSocial from '@/app/api/apiSocial';

vi.mock('@/app/api/apiSocial', () => ({
  obtenerAmigos: vi.fn(),
  obtenerSolicitudes: vi.fn(),
  enviarSolicitudAmistad: vi.fn(),
  responderSolicitud: vi.fn(),
  obtenerLeaderboardGlobal: vi.fn(),
  obtenerLeaderboardAmigos: vi.fn(),
  buscarJugadores: vi.fn(),
}));

describe('Pruebas del RF-29: Añadir amigo y solicitudes (incluye RF-31, RF-32)', () => {
  const mockUserContext = { user: { tag: 'AgenteTest' } };
  const mockSoundContext = { playClick: vi.fn(), playAceptar: vi.fn(), playWhoosh: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe permitir buscar y enviar una solicitud de amistad (RF-29)', async () => {
    apiSocial.obtenerAmigos.mockResolvedValue([]);
    apiSocial.obtenerSolicitudes.mockResolvedValue([]);
    apiSocial.obtenerLeaderboardGlobal.mockResolvedValue([]);
    apiSocial.obtenerLeaderboardAmigos.mockResolvedValue([]);
    apiSocial.buscarJugadores.mockResolvedValue([{ tag: 'EspiaNuevo', victorias: 5 }]);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <SoundContext.Provider value={mockSoundContext}>
            <Pantalla08Social />
          </SoundContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    );

    // Abrir modal de añadir
    const addOpenBtn = screen.getByRole('button', { name: '' }); 
    const buttons = screen.getAllByRole('button');
    const addBtnOpen = buttons.find(b => b.querySelector('svg.lucide-user-plus'));
    fireEvent.click(addBtnOpen);

    const inputBusqueda = screen.getByPlaceholderText(/Escribe parte del nombre/i);
    fireEvent.change(inputBusqueda, { target: { value: 'Espia' } });

    expect(await screen.findByText('EspiaNuevo')).toBeInTheDocument();

    const resultBtn = screen.getByText('EspiaNuevo').closest('button');
    fireEvent.click(resultBtn);

    await waitFor(() => {
      expect(apiSocial.enviarSolicitudAmistad).toHaveBeenCalledWith('EspiaNuevo');
    });
  });

  it('Debe permitir gestionar solicitudes entrantes (RF-31, RF-32)', async () => {
    apiSocial.obtenerAmigos.mockResolvedValue([]);
    apiSocial.obtenerSolicitudes.mockResolvedValue([
      { id_solicitante: 'user-789', tag_solicitante: 'EspiaAnonimo' }
    ]);
    apiSocial.obtenerLeaderboardGlobal.mockResolvedValue([]);
    apiSocial.obtenerLeaderboardAmigos.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <SoundContext.Provider value={mockSoundContext}>
            <Pantalla08Social />
          </SoundContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    );

    const tabSolicitudes = await screen.findByText(/SOLICITUDES \(1\)/i);
    fireEvent.click(tabSolicitudes);

    expect(screen.getByText('EspiaAnonimo')).toBeInTheDocument();

    // Aceptar (RF-31)
    const acceptBtn = screen.getByTitle('Aceptar');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(apiSocial.responderSolicitud).toHaveBeenCalledWith('user-789', 'aceptada');
    });
  });
});
