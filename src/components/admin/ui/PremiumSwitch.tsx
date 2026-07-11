'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export function PremiumSwitch({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>) {
  return (
    <div className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center">
      <SwitchPrimitives.Root
        className={cn(
          'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-sm transition-colors duration-300 ease-out',
          'bg-white/10 hover:bg-white/15 data-[state=checked]:bg-[#C9A227]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50 active:scale-95',
          className
        )}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-out',
            'data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]'
          )}
        />
      </SwitchPrimitives.Root>
    </div>
  )
}
