import { createContext } from 'react'

export type ToastItem = {
        id: string
        title?: string
        description?: string
        variant?: 'success' | 'error' | 'info'
        durationMs?: number
}

export type ToastContextValue = {
        push: (t: Omit<ToastItem, 'id'>) => void
        success: (msg: string) => void
        error: (msg: string) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)
