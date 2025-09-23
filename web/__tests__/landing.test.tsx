import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/components/ThemeProvider';

const renderWithTheme = (ui: React.ReactNode) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Landing page components', () => {
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = '';
  });

  it('renders hero copy and primary actions', () => {
    render(<Hero />);

    expect(screen.getByRole('heading', { name: 'Domina tu arte cervecero' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Probar BrewMaestro' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver demo interactiva' })).toBeInTheDocument();
  });

  it('exposes navigation with descriptive aria-labels', () => {
    renderWithTheme(<Header />);

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
    const menuButton = screen.getByRole('button', { name: 'Abrir menú' });
    fireEvent.click(menuButton);
    expect(screen.getByRole('navigation', { name: 'Navegación móvil' })).toBeInTheDocument();
  });

  it('persists dark mode preference in localStorage', () => {
    renderWithTheme(<ThemeToggle />);

    const button = screen.getByRole('button', { name: 'Cambiar a modo oscuro' });
    fireEvent.click(button);

    expect(window.localStorage.getItem('brewmaestro-theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
