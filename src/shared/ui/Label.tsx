import { cn } from './cn'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
	return <label className={cn('text-sm font-medium text-foreground/80', className)} {...props} />
}
