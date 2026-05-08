import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { Pantalla16Historial } from '@/app/pantallas/Pantalla16Historial';
import * as apiJugador from '@/app/api/apiJugador';

// Mock de la API de jugador
vi.mock('@/app/api/apiJugador', () => ({
  obtenerHistorial: vi.fn(),
}));

describe('Pruebas del RF-7: Consulta de historial de partidas', () => {

  it('Debe mostrar el historial de partidas correctamente para un Agente de Campo (Agente)', async () => {
    // Datos simulados que coinciden con el formato esperado por Pantalla16Historial
    const mockHistorial = [
      {
        id_partida: 101,
        fecha_fin: [2026, 5, 7], // Formato array [año, mes, día]
        equipo: 'Rojo',
        rol: 'Agente',
        rojo_gana: true,
        num_aciertos: 8,
        num_fallos: 3,
        nombre_tema: 'Misión Ártica'
      }
    ];

    apiJugador.obtenerHistorial.mockResolvedValue(mockHistorial);

    render(
      <MemoryRouter>
        <Pantalla16Historial />
      </MemoryRouter>
    );

    // Verificamos que se muestra el mensaje de carga inicialmente
    expect(screen.getByText(/EXTRAYENDO ARCHIVOS DE LA CENTRAL/i)).toBeInTheDocument();

    // Esperamos a que los datos se carguen y se rendericen
    await waitFor(() => {
      expect(screen.queryByText(/EXTRAYENDO ARCHIVOS/i)).not.toBeInTheDocument();
    });

    // Verificación de la fecha formateada (7/5/2026 para el array [2026, 5, 7])
    expect(screen.getByText(/7\/5\/2026/)).toBeInTheDocument();

    // Verificación del resultado (Victoria)
    // Usamos getAllByText porque "Victoria" puede aparecer en el resumen y en la lista
    const victoriaElements = screen.getAllByText(/Victoria/i);
    expect(victoriaElements.length).toBeGreaterThan(0);
    // Verificamos que al menos uno sea exactamente "Victoria" (el resultado en la lista)
    expect(screen.getByText('Victoria')).toBeInTheDocument();

    // Verificación del rol (En el código es 'Agente', el requisito dice 'Agente de Campo')
    // Nota: El componente actual muestra 'Agente'
    expect(screen.getByText(/Agente/)).toBeInTheDocument();

    // Verificación del equipo
    expect(screen.getByText(/Equipo Rojo/i)).toBeInTheDocument();

    // Verificación de aciertos y fallos (Solo para Agentes)
    expect(screen.getByText(/8✔ 3✖/)).toBeInTheDocument();
    
    // Verificación del nombre de la misión (Misión de Misión Ártica)
    expect(screen.getByText(/Misión de Misión Ártica/i)).toBeInTheDocument();
  });

  it('Debe mostrar el historial de partidas correctamente para un Jefe de Espías (Jefe)', async () => {
    const mockHistorial = [
      {
        id_partida: 102,
        fecha_fin: '2026-05-06T12:00:00', // Formato ISO string
        equipo: 'Azul',
        rol: 'Lider',
        rojo_gana: true, // Rojo gana, por lo tanto Azul pierde
        num_aciertos: 0,
        num_fallos: 0,
        nombre_tema: 'Animales'
      }
    ];

    apiJugador.obtenerHistorial.mockResolvedValue(mockHistorial);

    render(
      <MemoryRouter>
        <Pantalla16Historial />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/EXTRAYENDO ARCHIVOS/i)).not.toBeInTheDocument();
    });

    // Verificación de la fecha (6/5/2026)
    expect(screen.getByText(/6\/5\/2026/)).toBeInTheDocument();

    // Verificación del resultado (Derrota para el equipo Azul si gana el Rojo)
    expect(screen.getAllByText(/Derrota/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Derrota')).toBeInTheDocument();

    // Verificación del rol (Mapeado de 'Lider' a 'Jefe')
    expect(screen.getByText(/Jefe/)).toBeInTheDocument();

    // Verificación del equipo
    expect(screen.getByText(/Equipo Azul/i)).toBeInTheDocument();

    // Para el Jefe, no se deben mostrar aciertos/fallos sino el tema
    expect(screen.getAllByText(/Animales/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/✔/)).not.toBeInTheDocument();
  });

  it('Debe mostrar un mensaje de error si falla la carga del historial', async () => {
    apiJugador.obtenerHistorial.mockRejectedValue(new Error('Error de conexión'));

    render(
      <MemoryRouter>
        <Pantalla16Historial />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/EXTRAYENDO ARCHIVOS/i)).not.toBeInTheDocument();
    });

    // Verificación del mensaje de error definido en el componente
    expect(screen.getByText(/No se pudo acceder al archivo de la central/i)).toBeInTheDocument();
  });

  it('Debe mostrar un mensaje si el historial está vacío', async () => {
    apiJugador.obtenerHistorial.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Pantalla16Historial />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/EXTRAYENDO ARCHIVOS/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No hay registros operativos todavía/i)).toBeInTheDocument();
  });

});
