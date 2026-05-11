import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { SoundContext } from '@/app/context/SoundContext';
import { Pantalla12CrearPartida } from '@/app/pantallas/Pantalla12CrearPartida';
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

vi.mock('@/app/hooks/useSound', () => ({
  useSound: () => ({
    playClick: vi.fn(),
    playAceptar: vi.fn(),
    playCancelar: vi.fn(),
  }),
}));

describe('Pruebas del RF-13: Crear partida pública/privada', () => {
  const mockUser = { id_google: '123', tag: 'AgenteTest' };
  const mockUserContext = { user: mockUser };
  const mockSoundContext = {
    playClick: vi.fn(),
    playAceptar: vi.fn(),
    playCancelar: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe permitir configurar y crear una partida', async () => {
    apiPartidas.obtenerTemasJugador.mockResolvedValue([
      { id_tema: 1, nombre: 'Básico' },
      { id_tema: 2, nombre: 'Magia' }
    ]);
    apiPartidas.crearPartida.mockResolvedValue({ id_partida: 'partida-456' });

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <SoundContext.Provider value={mockSoundContext}>
            <Pantalla12CrearPartida />
          </SoundContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    );

    await screen.findByText(/MAGIA/i);

    // Seleccionar tiempo (usando el id o el texto del label real)
    const selectTiempo = screen.getByLabelText(/SELECCIONAR TIEMPO/i);
    fireEvent.change(selectTiempo, { target: { value: '60' } });

    // Alternar privacidad (pública por defecto, cambiar a privada)
    const privateOption = screen.getByText(/PRIVADA/i);
    fireEvent.click(privateOption);

    const createBtn = screen.getByText(/CREAR MISIÓN/i);
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(apiPartidas.crearPartida).toHaveBeenCalledWith(expect.objectContaining({
        tiempo_espera: 60,
        es_publica: false,
        id_tema: 1
      }));
    });
  });
});
