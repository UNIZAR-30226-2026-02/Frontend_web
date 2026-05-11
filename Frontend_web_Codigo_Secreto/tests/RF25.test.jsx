import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Pantalla15FinPartida } from '@/app/pantallas/Pantalla15FinPartida';
import { UserContext } from '@/app/components/UserContext'; 
import { SoundContext } from '@/app/context/SoundContext';

// Mock 
const mockUserValue = { user: { id_google: 'mock-user-id', tag: 'mock-user' } };
const mockSoundValue = {
  playClick: vi.fn(),
  playAceptar: vi.fn(),
  playCancelar: vi.fn(),
  playWhoosh: vi.fn(),
  playDisparo: vi.fn(),
  playTeclar: vi.fn(),
  playFiasco: vi.fn(),
  playAplauso: vi.fn(),
};

vi.mock('@/app/hooks/useSound', () => ({
  useSound: () => mockSoundValue,
}));

describe('Pruebas del RF-25: Resultados finales y aciertos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/fin')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            equipo_ganador: 'Azul',
            aciertos_rojo: 4,
            aciertos_azul: 9,
          })
        });
      }
      if (url.includes('/rol')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ equipo: 'azul' })
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });
  });

  it('Debe mostrar el resumen detallado de la misión', async () => {
    render(
      <MemoryRouter initialEntries={['/fin-partida/123']}>
        <UserContext.Provider value={mockUserValue}>
          <SoundContext.Provider value={mockSoundValue}>
            <Routes>
              <Route path="/fin-partida/:id_partida" element={<Pantalla15FinPartida />} />
            </Routes>
          </SoundContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/HAS GANADO/i)).toBeInTheDocument();
    expect(screen.getByText(/9/)).toBeInTheDocument(); // Puntos ganadores
    expect(screen.getByText(/4/)).toBeInTheDocument(); // Puntos perdedores
  });

  it('Debe mostrar mensaje de derrota si el equipo perdió', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/fin')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            equipo_ganador: 'Rojo',
            aciertos_rojo: 8,
            aciertos_azul: 2,
          })
        });
      }
      if (url.includes('/rol')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ equipo: 'azul' })
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });

    render(
      <MemoryRouter initialEntries={['/fin-partida/123']}>
        <UserContext.Provider value={mockUserValue}>
          <SoundContext.Provider value={mockSoundValue}>
            <Routes>
              <Route path="/fin-partida/:id_partida" element={<Pantalla15FinPartida />} />
            </Routes>
          </SoundContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/HAS PERDIDO/i)).toBeInTheDocument();
  });
});
