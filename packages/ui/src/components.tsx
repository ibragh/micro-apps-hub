import type { ButtonHTMLAttributes, ReactNode, HTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  block?: boolean;
}

export function Button({ variant = 'primary', block, className, ...rest }: ButtonProps) {
  const cls = [
    'mf-btn',
    variant === 'ghost' ? 'mf-btn--ghost' : '',
    block ? 'mf-btn--block' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return <button className={cls} {...rest} />;
}

export function Card({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['mf-card', className ?? ''].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export interface ChoiceProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  state?: 'correct' | 'wrong';
}

export function Choice({ selected, state, className, children, ...rest }: ChoiceProps) {
  const cls = [
    'mf-choice',
    state === 'correct' ? 'mf-choice--correct' : '',
    state === 'wrong' ? 'mf-choice--wrong' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} aria-pressed={selected ? true : undefined} {...rest}>
      {children}
    </button>
  );
}

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const safe = Math.max(0, Math.min(value, max));
  const percent = max === 0 ? 0 : Math.round((safe / max) * 100);
  return (
    <div
      className="mf-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={safe}
      aria-label={label}
    >
      <div className="mf-progress__bar" style={{ width: `${percent}%` }} />
    </div>
  );
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'info' | 'warning' | 'danger';
}

export function Badge({ tone = 'info', className, children, ...rest }: BadgeProps) {
  const cls = ['mf-badge', `mf-badge--${tone}`, className ?? ''].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}

export interface SourceLineProps {
  name: string;
  url?: string;
  bookReference?: string;
  isFictional?: boolean;
}

export function SourceLine({ name, url, bookReference, isFictional }: SourceLineProps) {
  if (isFictional) {
    return (
      <div className="mf-source" data-testid="source-line">
        <Badge tone="warning">محتوى افتراضي / غير واقعي</Badge>
      </div>
    );
  }
  return (
    <div className="mf-source" data-testid="source-line">
      <span>المصدر: </span>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {name}
        </a>
      ) : (
        <span>{name}</span>
      )}
      {bookReference ? <span> — {bookReference}</span> : null}
    </div>
  );
}

export function Stack({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['mf-stack', className ?? ''].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function Hero({ children }: { children: ReactNode }) {
  return <div className="mf-hero">{children}</div>;
}
