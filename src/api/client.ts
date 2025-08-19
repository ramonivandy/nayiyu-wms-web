const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export type ApiError = {
	status: number
	message: string
	errors?: Array<{ field?: string; message: string }>
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	}
        const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
        let data: unknown = null
        try {
                data = await res.json()
        } catch {
                // ignore invalid JSON responses
        }
        if (!res.ok) {
                const body = (typeof data === 'object' && data ? data : {}) as Record<string, unknown>
                const err: ApiError = {
                        status: res.status,
                        message: typeof body.message === 'string' ? body.message : res.statusText,
                        errors: Array.isArray(body.errors)
                                ? (body.errors as Array<{ field?: string; message: string }>)
                                : undefined,
                }
                throw err
        }
        return data as T
}

type FieldError = { field?: string; message: string }
type ApiErrorLike = { message?: string; errors?: FieldError[] }

export function humanizeApiError(error: unknown): string {
        if (!error || typeof error !== 'object') return 'Request failed'
        const err = error as ApiErrorLike
        if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
                const items = err.errors
                        .filter((x): x is FieldError => Boolean(x))
                        .map((x) => (x.field ? `${x.field}: ${x.message}` : x.message))
                        .join(', ')
                return `${err.message || 'Validation error'}: ${items}`
        }
        return err.message || 'Request failed'
}
