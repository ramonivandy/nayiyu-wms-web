import { apiFetch } from './client'
import type { MaterialDto, Pagination } from './types'

export async function listMaterials(params?: { page?: number; limit?: number; lowStock?: boolean }) {
	const query = new URLSearchParams()
	if (params?.page) query.set('page', String(params.page))
	if (params?.limit) query.set('limit', String(params.limit))
	if (params?.lowStock) query.set('lowStock', 'true')
	const res = await apiFetch<{ success: boolean; data: MaterialDto[]; pagination: Pagination }>(
		`/api/v1/materials${query.toString() ? `?${query.toString()}` : ''}`,
	)
	return res.data
}

export async function createMaterial(payload: {
	name: string
	quantity: number
	unit: string
	expiryDate?: string
	lowStockThreshold?: number
}) {
	const res = await apiFetch<{ success: boolean; data: MaterialDto }>(
		'/api/v1/materials',
		{ method: 'POST', body: JSON.stringify(payload) }
	)
	return res.data
}

export async function updateMaterial(id: string, payload: Partial<{
	name: string
	quantity: number
	unit: string
	expiryDate: string
	lowStockThreshold: number
}>) {
	const res = await apiFetch<{ success: boolean; data: MaterialDto }>(
		`/api/v1/materials/${id}`,
		{ method: 'PUT', body: JSON.stringify(payload) }
	)
	return res.data
}

export async function deleteMaterial(id: string) {
	await apiFetch<{ success: boolean }>(`/api/v1/materials/${id}`, { method: 'DELETE' })
}
