import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { Pantalla08Social } from '@/app/pantallas/Pantalla08Social';
import * as apiSocial from '@/app/api/apiSocial';

vi.mock('@/app/api/apiSocial', () => ({
  obtenerAmigos: vi.fn(),
  obtenerSolicitudes: vi.fn(),
  obtenerLeaderboardGlobal: vi.fn(),
  obtenerLeaderboardAmigos: vi.fn(),
}));

describe('Pruebas del RF-30: Buscar amigos en la lista', () => {
  const mockUserContext = { user: { tag: 'AgenteTest' } };
  const mockSoundContext = { playClick: vi.fn(), playWhoosh: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe filtrar la lista de amigos localmente', async () => {
    apiSocial.obtenerAmigos.mockResolvedValue([
      { tag: 'Amigo1', victorias: 10 },
      { tag: 'Contacto2', victorias: 5 }
    ]);
    apiSocial.obtenerSolicitudes.mockResolvedValue([]);
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

    expect(await screen.findByText('Amigo1')).toBeInTheDocument();
    expect(screen.getByText('Contacto2')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Buscar agente en tu red/i);
    fireEvent.change(searchInput, { target: { value: 'Amigo' } });

    expect(screen.getByText('Amigo1')).toBeInTheDocument();
    expect(screen.queryByText('Contacto2')).not.toBeInTheDocument();
  });
});
