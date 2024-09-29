'use client'


import { Button, type ButtonProps } from '@/components/ui/button';
import { IconRefresh } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface ButtonActionProps extends ButtonProps {
  actionTitle: string;
  callAction: () => void
}

export function ButtonAction({
  className,
  actionTitle,
  callAction,
  ...props
}: ButtonActionProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'right-4 top-1 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2',
        'opacity-100',
        className
      )}
      onClick={() => callAction()}
      {...props}
    >
      <IconRefresh />
      <span>{actionTitle}</span>
    </Button>
  )
}
