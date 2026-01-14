import * as React from "react"
import { cn } from "../../lib/utils"

const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => {
  const clampedValue = Math.max(0, Math.min(100, value || 0));

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-gray-700",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full bg-green-500 transition-all duration-200", indicatorClassName)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
})
Progress.displayName = "Progress"

export { Progress }
