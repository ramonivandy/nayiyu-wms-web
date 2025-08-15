import { apiFetch } from './client'
import type { AuthToken, User } from './types'

export async function apiLogin(email: string, password: string) {
	const res = await apiFetch<{ success: boolean; message: string; data: AuthToken }>(
		'/api/v1/auth/login',
		{ method: 'POST', body: JSON.stringify({ email, password }) }
	)
	return res.data
}

export async function apiProfile() {
	const res = await apiFetch<{ success: boolean; data: User }>(
		'/api/v1/auth/profile',
		{ method: 'GET' }
	)
	return res.data
}

export async function apiLogout() {
	await apiFetch<{ success: boolean; message: string }>(
		'/api/v1/auth/logout',
		{ method: 'POST' }
	)
}
