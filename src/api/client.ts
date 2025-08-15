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
	let data: any = null
	try {
		data = await res.json()
	} catch {}
	if (!res.ok) {
		const err: ApiError = {
			status: res.status,
			message: data?.message ?? res.statusText,
			errors: data?.errors,
		}
		throw err
	}
	return data as T
}

export function humanizeApiError(e: any): string {
	if (!e) return 'Request failed'
	if (e.errors && Array.isArray(e.errors) && e.errors.length > 0) {
		const items = e.errors
			.filter((x: any) => x)
			.map((x: any) => (x.field ? `${x.field}: ${x.message}` : x.message))
			.join(', ')
		return `${e.message || 'Validation error'}: ${items}`
	}
	return e.message || 'Request failed'
}
