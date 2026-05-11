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

describe('Pruebas del RF-33: Leaderboards global y de amigos', () => {
  const mockUserContext = { user: { tag: 'AgenteTest' } };
  const mockSoundContext = { playClick: vi.fn(), playWhoosh: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe alternar entre leaderboard global y de amigos', async () => {
    apiSocial.obtenerAmigos.mockResolvedValue([]);
    apiSocial.obtenerSolicitudes.mockResolvedValue([]);
    apiSocial.obtenerLeaderboardGlobal.mockResolvedValue([
      { tag: 'Top1Global', victorias: 500 }
    ]);
    apiSocial.obtenerLeaderboardAmigos.mockResolvedValue([
      { tag: 'Top1Amigo', victorias: 100 }
    ]);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <SoundContext.Provider value={mockSoundContext}>
            <Pantalla08Social />
          </SoundContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    );

    const tabClasificacion = await screen.findByText(/CLASIFICACIÓN/i);
    fireEvent.click(tabClasificacion);

    // Global por defecto
    expect(await screen.findByText('Top1Global')).toBeInTheDocument();

    // Cambiar a Amigos
    const friendsBtn = screen.getAllByRole('button', { name: /AMIGOS/i })[1];
    fireEvent.click(friendsBtn);

    expect(await screen.findByText('Top1Amigo')).toBeInTheDocument();
    expect(screen.queryByText('Top1Global')).not.toBeInTheDocument();
  });
});
