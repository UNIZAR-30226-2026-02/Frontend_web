import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { Pantalla02Home } from '@/app/pantallas/Pantalla02Home';
import * as apiPartidas from '@/app/api/apiPartidas';
import * as apiJugador from '@/app/api/apiJugador';

// Mock para STOMP
vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn(() => ({
    connect: vi.fn(),
    subscribe: vi.fn(),
    publish: vi.fn(),
    activate: vi.fn(function() { this.connected = true; }),
    deactivate: vi.fn(function() { this.connected = false; }),
    connected: false,
  })),
}));

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

vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn(),
  actualizarPerfil: vi.fn(),
  obtenerPersonalizaciones: vi.fn(),
  obtenerRanking: vi.fn(),
  obtenerEstadisticas: vi.fn(),
  obtenerLogros: vi.fn(),
  obtenerHistorial: vi.fn(),
}));

describe('Pruebas del RF-14: Unirse a partida privada', () => {
  const mockUserContext = { user: { tag: 'AgenteTest' } };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock del perfi sin partida activa
    apiJugador.obtenerPerfil.mockResolvedValue({
      tag: 'AgenteTest',
      balas: 100,
      partida_activa_id: null,
    });
  });

  it('Debe permitir unirse a una partida privada introduciendo el código', async () => {
    apiPartidas.unirsePartidaPrivada.mockResolvedValue({ id_partida: 'privada-123' });

    const { container } = render(
    <MemoryRouter>
      <UserContext.Provider value={mockUserContext}>
        <Pantalla02Home />
      </UserContext.Provider>
    </MemoryRouter>
  );

    // 1. Abrir el panel "Unirse a Misión"
    const unirseBtn = screen.getByText(/UNIRSE A MISIÓN/i);
    fireEvent.click(unirseBtn);

    // 2. Ahora debe aparecer el campo de código privado
    const inputCodigo = await screen.findByPlaceholderText(/FBI-XXXX/i);
    fireEvent.change(inputCodigo, { target: { value: 'ABC-1234' } });

    // 3. Hacer clic en el botón de enviar
    const btnEnviar = container.querySelector('.btn-validate');
    expect(btnEnviar).not.toBeNull(); // Verifica que esté presente
    fireEvent.click(btnEnviar);

    // 4. Esperar la llamada a la API
    await waitFor(() => {
      expect(apiPartidas.unirsePartidaPrivada).toHaveBeenCalledWith('ABC-1234');
    });
  });
});