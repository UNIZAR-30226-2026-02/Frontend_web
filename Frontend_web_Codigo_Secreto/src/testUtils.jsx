import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from './app/components/UserContext';
import { SoundProvider } from './app/context/SoundContext';
import { NotificacionesProvider } from './app/context/NotificacionesContext';

export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <UserProvider>
        <NotificacionesProvider>
          <SoundProvider>
            {ui}
          </SoundProvider>
        </NotificacionesProvider>
      </UserProvider>
    </MemoryRouter>
  );
}
