import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { UserContext } from '@/app/components/UserContext';
import { Pantalla01Login } from '@/app/pantallas/Pantalla01Login';
import * as apiLogin from '@/app/api/apiLogin';

vi.mock('@/app/api/apiLogin', () => ({
  loginConGoogle: vi.fn(),
}));

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: ({ onSuccess }) => (
    <button onClick={() => onSuccess({ credential: 'mock-id-token' })}>
      Sign in with Google
    </button>
  ),
}));

describe('Pruebas del RF-2: Login de usuario', () => {
  const mockUserContext = {
    loginUsuario: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe redirigir a /nombre-usuario-nuevo si el usuario es nuevo', async () => {
    apiLogin.loginConGoogle.mockResolvedValue({ es_nuevo: true });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <UserContext.Provider value={mockUserContext}>
          <Routes>
            <Route path="/login" element={<Pantalla01Login />} />
            <Route path="/nombre-usuario-nuevo" element={<div>Pantalla Registro Tag</div>} />
          </Routes>
        </UserContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Sign in with Google/i));

    await waitFor(() => {
      expect(apiLogin.loginConGoogle).toHaveBeenCalledWith('mock-id-token');
      expect(screen.getByText(/Pantalla Registro Tag/i)).toBeInTheDocument();
    });
  });

  it('Debe iniciar sesión y redirigir a /home si el usuario ya existe', async () => {
    const mockJugador = { id: 1, tag: 'AgenteExistente', partida_activa_id: null };
    apiLogin.loginConGoogle.mockResolvedValue({ es_nuevo: false, jugador: mockJugador, token: 'mock-jwt' });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <UserContext.Provider value={mockUserContext}>
          <Routes>
            <Route path="/login" element={<Pantalla01Login />} />
            <Route path="/home" element={<div>Pantalla Home</div>} />
          </Routes>
        </UserContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Sign in with Google/i));

    await waitFor(() => {
      expect(mockUserContext.loginUsuario).toHaveBeenCalledWith(mockJugador);
      expect(screen.getByText(/Pantalla Home/i)).toBeInTheDocument();
    });
  });
});
