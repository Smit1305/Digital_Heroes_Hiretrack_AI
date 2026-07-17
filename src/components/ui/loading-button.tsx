'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useRef, type ComponentProps } from 'react'

type ButtonProps = ComponentProps<typeof Button>

interface LoadingButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Show spinner and disable the button */
  loading?: boolean
  /** Text to show while loading (defaults to children) */
  loadingText?: string
  /** Click handler — typed to accept any mouse event */
  onClick?: (...args: unknown[]) => void
}

/**
 * A button that prevents double-click, shows a spinner during loading,
 * and disables itself while a request is in-flight.
 */
export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  onClick,
  className,
  ...props
}: LoadingButtonProps) {
  const lastClickRef = useRef(0)

  const handleClick = () => {
    // Prevent double-click within 300ms
    const now = Date.now()
    if (now - lastClickRef.current < 300) {
      return
    }
    lastClickRef.current = now

    onClick?.()
  }

  return (
    <Button
      disabled={loading || disabled}
      onClick={handleClick}
      className={cn('relative', className)}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2
          className="mr-2 h-4 w-4 animate-spin"
          aria-hidden="true"
        />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}
