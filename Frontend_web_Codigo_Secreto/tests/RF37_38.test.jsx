import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { SoundContext } from '@/app/context/SoundContext';
import { Pantalla06Manual } from '@/app/pantallas/Pantalla06Manual';

describe('Pruebas del RF-37_38: Música y efectos de sonido ajustables', () => {
  it('Debe permitir ajustar el volumen de la música y efectos', () => {
    const mockSoundContext = {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      setMusicVolume: vi.fn(),
      setSfxVolume: vi.fn(),
      playClick: vi.fn(),
    };

    render(
      <MemoryRouter>
        <SoundContext.Provider value={mockSoundContext}>
          <Pantalla06Manual />
        </SoundContext.Provider>
      </MemoryRouter>
    );

    const sliders = screen.getAllByRole('slider');
    const musicSlider = sliders[0];
    const sfxSlider = sliders[1];

    // Ajustar música al 80%
    fireEvent.change(musicSlider, { target: { value: '80' } });
    expect(mockSoundContext.setMusicVolume).toHaveBeenCalledWith(0.8);

    // Ajustar SFX al 30%
    fireEvent.change(sfxSlider, { target: { value: '30' } });
    expect(mockSoundContext.setSfxVolume).toHaveBeenCalledWith(0.3);
  });
});
