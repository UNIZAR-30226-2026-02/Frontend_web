import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { Pantalla05NombreUsuarioNuevo } from '@/app/pantallas/Pantalla05NombreUsuarioNuevo';
import * as apiLogin from '@/app/api/apiLogin';

vi.mock('@/app/api/apiLogin', () => ({
  registroNuevoUsuario: vi.fn(),
}));

describe('Pruebas del RF-1: Registro de nuevo usuario', () => {
  const mockUserContext = {
    loginUsuario: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe permitir registrar un nuevo tag y redirigir a home', async () => {
    apiLogin.registroNuevoUsuario.mockResolvedValue({ id: 1, tag: 'NuevoAgente' });

    // Simulamos la navegación con estado (idToken)
    render(
      <MemoryRouter initialEntries={[{ pathname: '/nombre-usuario-nuevo', state: { idToken: 'mock-id-token' } }]}>
        <UserContext.Provider value={mockUserContext}>
          <Routes>
            <Route path="/nombre-usuario-nuevo" element={<Pantalla05NombreUsuarioNuevo />} />
            <Route path="/home" element={<div>Pantalla Home</div>} />
          </Routes>
        </UserContext.Provider>
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Nombre/i);
    fireEvent.change(input, { target: { value: 'NuevoAgente' } });
    
    const submitBtn = screen.getByRole('button', { name: /CONFIRMAR IDENTIDAD/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiLogin.registroNuevoUsuario).toHaveBeenCalledWith('mock-id-token', 'NuevoAgente');
      expect(mockUserContext.loginUsuario).toHaveBeenCalled();
      expect(screen.getByText(/Pantalla Home/i)).toBeInTheDocument();
    });
  });

  it('Debe mostrar error si el registro falla', async () => {
    apiLogin.registroNuevoUsuario.mockRejectedValue(new Error('Tag ya existe'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={[{ pathname: '/nombre-usuario-nuevo', state: { idToken: 'mock-id-token' } }]}>
        <UserContext.Provider value={mockUserContext}>
          <Pantalla05NombreUsuarioNuevo />
        </UserContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Nombre/i), { target: { value: 'AgenteRepetido' } });
    fireEvent.click(screen.getByRole('button', { name: /CONFIRMAR IDENTIDAD/i }));

    await waitFor(() => {
      expect(screen.getByText(/Tag ya existe/i)).toBeInTheDocument();
    });
  });
});
