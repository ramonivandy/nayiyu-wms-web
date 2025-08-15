import { useMemo } from 'react'
import { useLocalStore } from '../../shared/useLocalStore'
import type { Material, Product } from './types'

export function useInventorySummary() {
	const materials = useLocalStore<Material[]>('materials', [])
	const products = useLocalStore<Product[]>('products', [])

	return useMemo(() => {
		const totalMaterials = materials.value.length
		const totalProducts = products.value.length
		const lowStockCount = materials.value.filter((m) => m.threshold != null && m.quantity <= m.threshold).length
		const now = new Date()
		const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
		const expiringSoonCount = materials.value.filter((m) => m.expiry && new Date(m.expiry) <= soon).length
		return { totalMaterials, totalProducts, lowStockCount, expiringSoonCount }
	}, [materials.value, products.value])
}
