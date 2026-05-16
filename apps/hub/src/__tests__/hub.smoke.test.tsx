import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('hub smoke', () => {
  it('renders the AppShell + hero', () => {
    render(<App />);
    expect(screen.getByTestId('app-root')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /مفيد/ })).toBeInTheDocument();
  });

  it('renders all 30 app cards by default', () => {
    render(<App />);
    expect(screen.getAllByTestId('hub-card').length).toBe(30);
  });

  it('every card links to a subdomain or local-hash placeholder', () => {
    render(<App />);
    for (const card of screen.getAllByTestId('hub-card')) {
      const href = card.getAttribute('href');
      expect(href).toBeTruthy();
      // production subdomain (https://…), local-dev port (http://127.0.0.1:…),
      // or hash anchor when neither env is set.
      expect(href).toMatch(/^(https:\/\/|http:\/\/127\.0\.0\.1:\d+\/|#)/);
    }
  });
});
