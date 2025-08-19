import { useEffect, useState } from 'react'

export function useLocalStore<T>(key: string, initialValue: T) {
	const [value, setValue] = useState<T>(() => {
		try {
			const raw = localStorage.getItem(key)
			return raw ? (JSON.parse(raw) as T) : initialValue
		} catch {
			return initialValue
		}
	})

	useEffect(() => {
                try {
                        localStorage.setItem(key, JSON.stringify(value))
                } catch {
                        // ignore storage errors
                }
        }, [key, value])

	return { value, setValue }
}
