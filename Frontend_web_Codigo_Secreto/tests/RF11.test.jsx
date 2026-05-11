import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    if (url.includes('/fin')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ equipo_ganador: 'rojo', aciertos_rojo: 8, aciertos_azul: 5 }) });
    }
    if (url.includes('/rol')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ equipo: 'rojo' }) });
    }
    return Promise.reject('URL no mockeada');
  });
});

describe('Pruebas del RF-11: Recompensas de balas', () => {
  it('Debe mostrar las balas obtenidas al finalizar la partida', async () => {
    render(
      <MemoryRouter initialEntries={['/fin-partida/123']}>
        <Routes>
          <Route path="/fin-partida/:id_partida" element={
            <UserContext.Provider value={mockUserValue}>
              <SoundContext.Provider value={mockSoundValue}>
                <Pantalla15FinPartida />
              </SoundContext.Provider>
            </UserContext.Provider>
          } />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/INFORME DE CLASIFICACIÓN FINAL/i)).toBeInTheDocument();
      expect(screen.getByText(/8/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
      expect(screen.getByText(/HAS GANADO/i)).toBeInTheDocument();
    });
  });
});