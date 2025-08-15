import { cn } from './cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
	return (
		<input
			className={cn(
				'flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
				,
				className
			)}
			{...props}
		/>
	)
}
