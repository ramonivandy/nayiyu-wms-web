import { useCallback, useMemo, useState } from 'react'
import type { ToastItem } from './context'
import { ToastContext } from './context'

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([])

	const remove = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id))
	}, [])

	const push = useCallback((t: Omit<ToastItem, 'id'>) => {
		const id = crypto.randomUUID()
		const duration = t.durationMs ?? 3000
		setToasts((prev) => [...prev, { id, ...t }])
		window.setTimeout(() => remove(id), duration)
	}, [remove])

	const success = useCallback((msg: string) => push({ description: msg, variant: 'success' }), [push])
	const error = useCallback((msg: string) => push({ description: msg, variant: 'error', durationMs: 5000 }), [push])

	const value = useMemo(() => ({ push, success, error }), [push, success, error])

	return (
                <ToastContext.Provider value={value}>
			{children}
			<div className="pointer-events-none fixed right-3 top-16 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`pointer-events-auto rounded-lg border p-3 shadow-sm animate-in fade-in slide-in-from-top-2 ${
							t.variant === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : t.variant === 'error' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-blue-200 bg-blue-50 text-blue-900'
						}`}
					>
						{t.title && <div className="text-sm font-medium">{t.title}</div>}
						{t.description && <div className="text-sm">{t.description}</div>}
					</div>
				))}
			</div>
                </ToastContext.Provider>
        )
}
