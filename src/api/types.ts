export type User = {
	id: string
	email: string
	firstName: string
	lastName: string
	role: string
	active: boolean
	createdAt: string
	updatedAt: string
}

export type AuthToken = {
	token: string
	user: User
}

export type Pagination = {
	page: number
	limit: number
	totalCount: number
	totalPages: number
}

export type MaterialDto = {
	id: string
	name: string
	quantity: number
	unit: string
	expiryDate?: string
	lowStockThreshold?: number
	createdAt: string
	updatedAt: string
}

export type BomItemDto = {
	id: string
	productId: string
	materialId: string
	quantityPerPortion: number
	createdAt: string
	updatedAt: string
	material?: MaterialDto
}

export type ProductDto = {
	id: string
	name: string
	createdAt: string
	updatedAt: string
	bomItems?: BomItemDto[]
	bom?: Array<{ id: string; materialId: string; quantityPerPortion: number; materialName?: string }>
}

export type OrderItemDto = {
	id: string
	orderId: string
	productId: string | null
	productNameSnapshot: string
	quantity: number
	createdAt: string
	product?: ProductDto
}

export type OrderDto = {
	id: string
	orderDate: string
	status: string // CONFIRMED | CANCELLED
	createdAt: string
	updatedAt: string
	items: OrderItemDto[]
}

export type CalculationResultDto = {
	maxProduciblePortions: number
	shortages: Array<{
		materialId: string
		materialName: string
		required: number
		available: number
		deficit: number
	}>
}
