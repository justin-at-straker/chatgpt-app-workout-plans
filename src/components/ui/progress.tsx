import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
	React.ElementRef<typeof ProgressPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
	<ProgressPrimitive.Root
		ref={ref}
		className={cn(
			"relative h-1.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100",
			className
		)}
		{...props}
	>
		<ProgressPrimitive.Indicator
			className="h-full w-full flex-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all"
			style={{
				transform: `translateX(-${100 - (value || 0)}%)`,
				boxShadow: "0 8px 20px -12px rgba(99,102,241,0.65)",
			}}
		/>
	</ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
