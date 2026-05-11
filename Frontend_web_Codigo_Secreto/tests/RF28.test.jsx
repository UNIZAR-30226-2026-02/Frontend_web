import React from 'react';
import { render, screen } from '@testing-library/react';
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

describe('Pruebas del RF-28: Lista de amigos y victorias', () => {
  const mockUserContext = { user: { tag: 'AgenteTest' } };
  const mockSoundContext = { playClick: vi.fn(), playWhoosh: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe mostrar la lista de amigos con sus victorias', async () => {
    apiSocial.obtenerAmigos.mockResolvedValue([
      { tag: 'AmigoFiel', victorias: 15 },
      { tag: 'SocioEstrategico', victorias: 8 }
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

    expect(await screen.findByText('AmigoFiel')).toBeInTheDocument();
    expect(screen.getByText(/15 victorias/i)).toBeInTheDocument();
    expect(screen.getByText('SocioEstrategico')).toBeInTheDocument();
    expect(screen.getByText(/8 victorias/i)).toBeInTheDocument();
  });
});
