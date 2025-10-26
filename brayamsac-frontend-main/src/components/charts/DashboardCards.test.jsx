import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DashboardCards from '../components/DashboardCards';

// Mock del router para tests
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('DashboardCards', () => {
  const defaultProps = {
    almacenes: 5,
    coordinadores: 3,
    trabajadores: 25
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar las cards correctamente', () => {
    render(
      <RouterWrapper>
        <DashboardCards {...defaultProps} />
      </RouterWrapper>
    );

    expect(screen.getByText('Almacenes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Coordinadores')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Trabajadores')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('debe manejar valores por defecto', () => {
    render(
      <RouterWrapper>
        <DashboardCards />
      </RouterWrapper>
    );

    // Debe mostrar 0 para valores no proporcionados
    const cards = screen.getAllByText('0');
    expect(cards).toHaveLength(3); // Debería haber 3 cards con valor 0
  });

  it('debe tener las clases CSS correctas', () => {
    render(
      <RouterWrapper>
        <DashboardCards {...defaultProps} />
      </RouterWrapper>
    );

    const container = screen.getByText('Almacenes').closest('div');
    expect(container).toHaveClass('bg-blue-400');
  });

  it('debe ser responsive', () => {
    render(
      <RouterWrapper>
        <DashboardCards {...defaultProps} />
      </RouterWrapper>
    );

    const gridContainer = screen.getByText('Almacenes').closest('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
  });
});

describe('DashboardCards - Accesibilidad', () => {
  it('debe tener contenido accesible', () => {
    render(
      <RouterWrapper>
        <DashboardCards almacenes={5} coordinadores={3} trabajadores={25} />
      </RouterWrapper>
    );

    // Verificar que los números son legibles
    expect(screen.getByText('5')).toBeVisible();
    expect(screen.getByText('3')).toBeVisible();
    expect(screen.getByText('25')).toBeVisible();
  });
});
