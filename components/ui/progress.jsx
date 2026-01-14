import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "../../lib/utils"

const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-gray-700",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full bg-green-500 transition-all duration-200", indicatorClassName)}
      style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
