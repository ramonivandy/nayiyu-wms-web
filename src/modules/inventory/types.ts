export type Material = {
	id: string
	name: string
	unit: string
	quantity: number
	threshold?: number
	expiry?: string // ISO date
}

export type BomItem = {
	materialId: string
	quantity: number
}

export type Product = {
	id: string
	name: string
	unit: string
	quantity: number
	bom: BomItem[]
}
