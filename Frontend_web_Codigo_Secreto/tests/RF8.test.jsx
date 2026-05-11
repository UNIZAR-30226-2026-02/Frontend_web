import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { Pantalla10Logros } from '@/app/pantallas/Pantalla10Logros';
import * as apiJugador from '@/app/api/apiJugador';

vi.mock('@/app/api/apiJugador', () => ({
  obtenerLogros: vi.fn(),
  obtenerPerfil: vi.fn(),
  actualizarPerfil: vi.fn(),
  obtenerRanking: vi.fn(),
  obtenerEstadisticas: vi.fn(),
  obtenerHistorial: vi.fn(),
}));

describe('Pruebas del RF-8: Consulta de logros y medallas', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe mostrar la lista de logros y medallas con su progreso', async () => {
    const mockLogros = [
      {
        id: 1,
        nombre: 'Agente principiante',
        descripcion: 'Completa tu primera partida',
        es_logro: true,
        completado: true,
        progreso_actual: 1,
        progreso_max: 1,
        balas_recompensa: 50,
        rareza: 'bronce'
      },
      {
        id: 2,
        nombre: 'Agente de bronce',
        descripcion: '50 partidas ganadas',
        es_logro: true,
        completado: false,
        progreso_actual: 10,
        progreso_max: 50,
        rareza: 'bronce'
      }
    ];

    apiJugador.obtenerLogros.mockResolvedValue(mockLogros);

    render(
      <MemoryRouter>
        <Pantalla10Logros />
      </MemoryRouter>
    );

    // Verificación de títulos y estadísticas
    expect(await screen.findByText(/LOGROS OPERATIVOS/i)).toBeInTheDocument();
    expect(screen.getByText(/MEDALLAS DE SERVICIO/i)).toBeInTheDocument();

    // Verificación de un logro completado
    expect(screen.getByText(/Agente principiante/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ COMPLETADO/i)).toBeInTheDocument();

    // Verificación de una medalla no obtenida
    expect(screen.getByText(/Agente de bronce/i)).toBeInTheDocument();
    expect(screen.getByText(/10\/50/i)).toBeInTheDocument();
    
    // Verificación de balas ganadas en el resumen
    expect(screen.getByText('50')).toBeInTheDocument(); // Balas ganadas
  });
});
