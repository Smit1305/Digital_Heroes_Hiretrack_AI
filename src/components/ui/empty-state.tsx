import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'search' | 'error' | 'permission'
  className?: string
}

const VARIANT_ILLUSTRATIONS: Record<string, React.ReactNode> = {
  default: (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="15" y="20" width="90" height="60" rx="8" className="fill-muted/50 stroke-border" strokeWidth="1.5" />
      <rect x="25" y="32" width="40" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="25" y="42" width="70" height="4" rx="2" className="fill-muted-foreground/15" />
      <rect x="25" y="52" width="55" height="4" rx="2" className="fill-muted-foreground/10" />
      <rect x="25" y="62" width="30" height="4" rx="2" className="fill-muted-foreground/10" />
      <circle cx="90" cy="70" r="18" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
      <line x1="86" y1="70" x2="94" y2="70" strokeWidth="2" strokeLinecap="round" className="stroke-primary/40" />
      <line x1="90" y1="66" x2="90" y2="74" strokeWidth="2" strokeLinecap="round" className="stroke-primary/40" />
    </svg>
  ),
  search: (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="50" cy="45" r="25" className="stroke-muted-foreground/20 fill-muted/30" strokeWidth="2" />
      <line x1="68" y1="63" x2="88" y2="83" strokeWidth="4" strokeLinecap="round" className="stroke-muted-foreground/20" />
      <line x1="40" y1="40" x2="60" y2="40" strokeWidth="2" strokeLinecap="round" className="stroke-muted-foreground/15" />
      <line x1="40" y1="48" x2="55" y2="48" strokeWidth="2" strokeLinecap="round" className="stroke-muted-foreground/10" />
    </svg>
  ),
  error: (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="45" r="30" className="fill-destructive/10 stroke-destructive/30" strokeWidth="1.5" />
      <line x1="60" y1="30" x2="60" y2="50" strokeWidth="3" strokeLinecap="round" className="stroke-destructive/50" />
      <circle cx="60" cy="58" r="2" className="fill-destructive/50" />
    </svg>
  ),
  permission: (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="35" y="35" width="50" height="40" rx="6" className="fill-muted/50 stroke-border" strokeWidth="1.5" />
      <circle cx="60" cy="30" r="12" className="stroke-muted-foreground/20 fill-none" strokeWidth="2.5" />
      <circle cx="60" cy="52" r="4" className="fill-muted-foreground/30" />
      <line x1="60" y1="56" x2="60" y2="65" strokeWidth="2" strokeLinecap="round" className="stroke-muted-foreground/30" />
    </svg>
  ),
}

/**
 * Reusable empty state with inline SVG illustrations.
 * Supports variants: default, search, error, permission.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const illustration = icon ?? VARIANT_ILLUSTRATIONS[variant]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
      role="status"
    >
      <div className="mb-4">
        {illustration}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
