import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('history-secrets smoke', () => {
  it('renders the AppShell', () => {
    render(<App />);
    expect(screen.getByTestId('app-root')).toBeInTheDocument();
    // title appears in the header and may also appear in a Hero — assert >= 1.
    expect(screen.getAllByText("أسرار التاريخ").length).toBeGreaterThan(0);
  });
});
