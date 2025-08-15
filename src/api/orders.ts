import { apiFetch } from './client'
import type { OrderDto, Pagination, OrderItemDto } from './types'

export async function listOrders(params?: { page?: number; limit?: number }) {
	const query = new URLSearchParams()
	if (params?.page) query.set('page', String(params.page))
	if (params?.limit) query.set('limit', String(params.limit))
	const res = await apiFetch<{ success: boolean; data: OrderDto[]; pagination: Pagination }>(
		`/api/v1/orders${query.toString() ? `?${query.toString()}` : ''}`,
	)
	return res.data
}

export async function createOrder(payload: { orderDate: string; items: Array<{ productId: string; quantity: number }> }) {
	const res = await apiFetch<{ success: boolean; data: OrderDto }>(
		'/api/v1/orders',
		{ method: 'POST', body: JSON.stringify(payload) }
	)
	return res.data
}

export async function updateOrderItemQuantity(orderId: string, itemId: string, quantity: number) {
	const res = await apiFetch<{ success: boolean; data: OrderItemDto }>(
		`/api/v1/orders/${orderId}/items/${itemId}/quantity`,
		{ method: 'PUT', body: JSON.stringify({ quantity }) }
	)
	return res.data
}

export async function cancelOrder(id: string) {
	const res = await apiFetch<{ success: boolean; data: OrderDto }>(
		`/api/v1/orders/${id}/cancel`,
		{ method: 'POST' }
	)
	return res.data
}

export async function completeOrder(id: string) {
	const res = await apiFetch<{ success: boolean; data: OrderDto }>(
		`/api/v1/orders/${id}/complete`,
		{ method: 'POST' }
	)
	return res.data
}
