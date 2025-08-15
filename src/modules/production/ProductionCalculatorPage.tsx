import { useMemo, useState } from 'react'
import { useLocalStore } from '../../shared/useLocalStore'
import type { Material, Product } from '../inventory/types'
import { Label } from '../../shared/ui/Label'

export function ProductionCalculatorPage() {
	const materials = useLocalStore<Material[]>('materials', [])
	const products = useLocalStore<Product[]>('products', [])
	const [productId, setProductId] = useState<string>('')

	const selected = products.value.find((p) => p.id === productId)
	const { maxPortions, shortages } = useMemo(() => calculate(selected, materials.value), [selected, materials.value])

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Production Calculator</h2>
			<div className="rounded-xl border p-4 bg-card grid gap-3">
				<div>
					<Label>Product</Label>
					<select
						className="h-9 w-full rounded-md border bg-background px-2 text-sm"
						value={productId}
						onChange={(e) => setProductId(e.target.value)}
					>
						<option value="">Select product</option>
						{products.value.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</div>

				{selected && (
					<div className="grid gap-3">
						<div className="rounded-lg border p-3">
							<div className="text-sm">Max producible portions</div>
							<div className="text-3xl font-semibold">{maxPortions}</div>
						</div>
						<div className="rounded-lg border p-3">
							<div className="text-sm font-medium mb-2">Shortages</div>
							{shortages.length === 0 && <div className="text-sm text-foreground/60">No shortages.</div>}
							<ul className="text-sm grid gap-1">
								{shortages.map((s, idx) => (
									<li key={idx} className="flex justify-between">
										<span>{s.name}</span>
										<span>
											Need {s.need} / Have {s.have} {s.unit}
										</span>
									</li>
								))}
						</ul>
					</div>
					</div>
				)}
			</div>
		</div>
	)
}

function calculate(product: Product | undefined, materials: Material[]) {
	if (!product) return { maxPortions: 0, shortages: [] as { name: string; need: number; have: number; unit: string }[] }
	let max = Infinity
	const shortages: { name: string; need: number; have: number; unit: string }[] = []
	for (const b of product.bom) {
		const m = materials.find((x) => x.id === b.materialId)
		const have = m?.quantity ?? 0
		const needPer = b.quantity
		if (needPer <= 0) continue
		const possible = Math.floor(have / needPer)
		max = Math.min(max, possible)
		if (have < needPer) shortages.push({ name: m?.name ?? 'Unknown', need: needPer, have, unit: m?.unit ?? '' })
	}
	if (max === Infinity) max = 0
	return { maxPortions: max, shortages }
}
