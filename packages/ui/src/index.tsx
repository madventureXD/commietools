import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

export function Button({ children, className = '', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return <button className={`button ${className}`.trim()} {...props}>{children}</button>
}

export function LocalBadge({ children }: PropsWithChildren) {
  return <span className="local-badge"><span aria-hidden="true">●</span>{children}</span>
}

