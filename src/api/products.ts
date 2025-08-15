import { apiFetch } from './client'
import type { Pagination, ProductDto } from './types'

export async function listProducts(params?: { page?: number; limit?: number }) {
	const query = new URLSearchParams()
	if (params?.page) query.set('page', String(params.page))
	if (params?.limit) query.set('limit', String(params.limit))
	const res = await apiFetch<{ success: boolean; data: ProductDto[]; pagination: Pagination }>(
		`/api/v1/products${query.toString() ? `?${query.toString()}` : ''}`,
	)
	return res.data
}

export async function createProduct(payload: { name: string }) {
	const res = await apiFetch<{ success: boolean; data: ProductDto }>(
		'/api/v1/products',
		{ method: 'POST', body: JSON.stringify(payload) }
	)
	return res.data
}

export async function updateProduct(id: string, payload: Partial<{ name: string }>) {
	const res = await apiFetch<{ success: boolean; data: ProductDto }>(
		`/api/v1/products/${id}`,
		{ method: 'PUT', body: JSON.stringify(payload) }
	)
	return res.data
}

export async function deleteProduct(id: string) {
	await apiFetch<{ success: boolean }>(`/api/v1/products/${id}`, { method: 'DELETE' })
}

export async function getProductWithBom(id: string) {
	const res = await apiFetch<{ success: boolean; data: ProductDto }>(
		`/api/v1/products/${id}/bom`,
	)
	return res.data
}

export async function setProductBom(id: string, items: Array<{ materialId: string; quantityPerPortion: number }>) {
	const res = await apiFetch<{ success: boolean; data: ProductDto }>(
		`/api/v1/products/${id}/bom`,
		{ method: 'POST', body: JSON.stringify({ items }) }
	)
	return res.data
}
