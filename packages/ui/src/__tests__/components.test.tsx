import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AppShell } from '../AppShell';
import { Button, Choice, ProgressBar, SourceLine } from '../components';

describe('AppShell', () => {
  it('renders titles, main, skip link', () => {
    render(
      <AppShell titleAr="عنوان" titleEn="title">
        <p>محتوى</p>
      </AppShell>,
    );
    expect(screen.getByTestId('app-root')).toBeInTheDocument();
    expect(screen.getByText('عنوان')).toBeInTheDocument();
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('محتوى')).toBeInTheDocument();
    expect(screen.getByText('تجاوز إلى المحتوى')).toBeInTheDocument();
  });
});

describe('Button', () => {
  it('renders ghost variant class', () => {
    render(<Button variant="ghost">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('mf-btn--ghost');
  });
});

describe('Choice', () => {
  it('reflects selected via aria-pressed', () => {
    render(<Choice selected>اختيار</Choice>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('ProgressBar', () => {
  it('clamps value and exposes ARIA', () => {
    render(<ProgressBar value={120} max={100} label="تقدم" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar).toHaveAttribute('aria-label', 'تقدم');
  });
});

describe('SourceLine', () => {
  it('renders fictional badge when isFictional', () => {
    render(<SourceLine name="x" isFictional />);
    expect(screen.getByText('محتوى افتراضي / غير واقعي')).toBeInTheDocument();
  });
  it('renders source link when url provided', () => {
    render(<SourceLine name="Britannica" url="https://example.com" />);
    expect(screen.getByRole('link', { name: 'Britannica' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });
});
