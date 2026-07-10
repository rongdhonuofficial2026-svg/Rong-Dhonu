'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export function PremiumSwitch({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>) {
  return (
    <div className="admin-switch-touch flex items-center justify-center shrink-0">
      <SwitchPrimitives.Root
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border shadow-sm transition-all duration-300 ease-out',
          'border-white/10 bg-white/10 data-[state=checked]:bg-[#C9A227] data-[state=checked]:border-[#C9A227]/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-out',
            'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5'
          )}
        />
      </SwitchPrimitives.Root>
    </div>
  )
}
