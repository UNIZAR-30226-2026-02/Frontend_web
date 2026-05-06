import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { UserContext } from '@/app/components/UserContext';

// Importación del componente de React a probar mediante el alias de directorio
import { Pantalla11Perfil } from '@/app/pantallas/Pantalla11Perfil'; 

// Importación del módulo de la API del cual se realizará la simulación
import * as apiJugador from '@/app/api/apiJugador'; 
import * as apiTienda from '@/app/api/apiTienda';

// Creación del mock para sustituir el archivo de la API real por uno simulado
vi.mock('@/app/api/apiJugador', () => ({
  obtenerPerfil: vi.fn(),
  actualizarPerfil: vi.fn(),
  obtenerPersonalizaciones: vi.fn(),
  equiparPersonalizacion: vi.fn()
}));

vi.mock('@/app/api/apiTienda', () => ({
  obtenerPersonalizacionesJugador: vi.fn()
}));

describe('Pruebas del RF-5: Consulta de información personal', () => {
  
  it('Debe mostrar el tag, estadísticas y balas del usuario correctamente', async () => {
    
    // Configuración del comportamiento simulado para la función obtenerPerfil
    apiJugador.obtenerPerfil.mockResolvedValue({
      tag: 'AgenteSecreto007',
      foto_perfil: '1',
      balas: 1250,
      partidas_jugadas: 57,
      victorias: 45,
      num_aciertos: 320,
      num_fallos: 15
    });

    apiTienda.obtenerPersonalizacionesJugador.mockResolvedValue([]);

    const mockUserContext = {
      logout: vi.fn(),
      setUser: vi.fn(),
      desactivarCuenta: vi.fn()
    };

    // Ejecución del renderizado virtual del componente en el entorno de pruebas
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla11Perfil />
        </UserContext.Provider>
      </MemoryRouter>
    );

    // Verificación de la aparición del nombre de usuario (tag) de forma asíncrona
    // Se usa findAllByText porque el tag aparece en varios sitios (Polaroid y cabecera)
    const tagElements = await screen.findAllByText(/AgenteSecreto007/i);
    expect(tagElements.length).toBeGreaterThan(0);
    
    // Comprobación de que la cantidad de balas se visualiza correctamente en la interfaz
    // Usamos una expresión regular flexible para el formato de número (con o sin punto/coma)
    expect(screen.getByText(/1[.,]?250\s*BALAS/i)).toBeInTheDocument();
    
    // Validación de la correcta visualización de los datos estadísticos del jugador
    // Buscamos los números que representan las estadísticas
    expect(screen.getAllByText('45').length).toBeGreaterThan(0); // Victorias
    expect(screen.getAllByText('12').length).toBeGreaterThan(0); // Derrotas (57 - 45)
    expect(screen.getAllByText('320').length).toBeGreaterThan(0); // Aciertos
    expect(screen.getAllByText('15').length).toBeGreaterThan(0); // Fallos

    // Verificación de que la función del mock ha sido invocada al menos una vez
    expect(apiJugador.obtenerPerfil).toHaveBeenCalled();
  });

});