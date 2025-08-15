import { useState } from 'react'
import { useApi } from '../../shared/useApi'
import { listProducts } from '../../api/products'
import { Label } from '../../shared/ui/Label'
import type { ProductDto, CalculationResultDto } from '../../api/types'
import { apiFetch } from '../../api/client'

export function ProductionCalculatorPage() {
	const products = useApi<ProductDto[]>(() => listProducts(), [])
	const [productId, setProductId] = useState<string>('')
	const [result, setResult] = useState<CalculationResultDto | null>(null)

	async function calculate() {
		if (!productId) return
		const res = await apiFetch<{ success: boolean; data: CalculationResultDto }>(
			'/api/v1/calculations/production',
			{ method: 'POST', body: JSON.stringify({ productId }) }
		)
		setResult(res.data)
	}

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
						{(products.data ?? []).map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</div>
				<button onClick={calculate} className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm">Calculate</button>

				{result && (
					<div className="grid gap-3">
						<div className="rounded-lg border p-3">
							<div className="text-sm">Max producible portions</div>
							<div className="text-3xl font-semibold">{result.maxProduciblePortions}</div>
						</div>
						<div className="rounded-lg border p-3">
							<div className="text-sm font-medium mb-2">Shortages</div>
							{result.shortages.length === 0 && <div className="text-sm text-foreground/60">No shortages.</div>}
							<ul className="text-sm grid gap-1">
								{result.shortages.map((s, idx) => (
									<li key={idx} className="flex justify-between">
										<span>{s.materialName}</span>
										<span>
											Need {s.required} / Have {s.available}
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
