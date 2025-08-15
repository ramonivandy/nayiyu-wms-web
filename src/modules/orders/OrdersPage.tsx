import { useMemo, useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { useLocalStore } from '../../shared/useLocalStore'
import type { Material, Product } from '../inventory/types'

export type Order = { id: string; productId: string; quantity: number; createdAt: string }

const EDIT_WINDOW_MS = 5 * 60 * 1000

export function OrdersPage() {
	const materials = useLocalStore<Material[]>('materials', [])
	const products = useLocalStore<Product[]>('products', [])
	const orders = useLocalStore<Order[]>('orders', [])
	const [productId, setProductId] = useState<string>('')
	const [qty, setQty] = useState<number>(1)

	const selected = products.value.find((p) => p.id === productId)
	const { canFulfill, shortages } = useMemo(() => validateOrder(materials.value, selected, qty), [materials.value, selected, qty])

	function placeOrder() {
		if (!selected || qty <= 0) return
		if (!canFulfill) return
		const id = crypto.randomUUID()
		const createdAt = new Date().toISOString()
		orders.setValue([{ id, productId: selected.id, quantity: qty, createdAt }, ...orders.value])
		applyMaterialDelta(selected, materials, -qty)
		// reset form fields
		setProductId('')
		setQty(1)
	}

	function cancelOrder(order: Order) {
		const product = products.value.find((p) => p.id === order.productId)
		if (!product) return
		orders.setValue(orders.value.filter((o) => o.id !== order.id))
		applyMaterialDelta(product, materials, +order.quantity)
	}

	function canEdit(order: Order) {
		return Date.now() - new Date(order.createdAt).getTime() <= EDIT_WINDOW_MS
	}

	function editOrderQuantity(order: Order, newQty: number) {
		const product = products.value.find((p) => p.id === order.productId)
		if (!product || newQty <= 0) return
		if (!canEdit(order)) return
		// revert previous consumption then apply new one
		applyMaterialDelta(product, materials, +order.quantity)
		const { canFulfill } = validateOrder(materials.value, product, newQty)
		if (!canFulfill) {
			// re-apply old consumption to keep state unchanged
			applyMaterialDelta(product, materials, -order.quantity)
			return
		}
		applyMaterialDelta(product, materials, -newQty)
		orders.setValue(
			orders.value.map((o) => (o.id === order.id ? { ...o, quantity: newQty } : o))
		)
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Orders</h2>
			<div className="rounded-xl border p-4 bg-card grid gap-3">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div className="sm:col-span-2">
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
					<div>
						<Label>Quantity</Label>
						<Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
					</div>
				</div>

				{selected && (
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium mb-2">Requirements</div>
						<ul className="text-sm grid gap-1">
							{selected.bom.map((b, idx) => {
								const mat = materials.value.find((m) => m.id === b.materialId)
								const need = b.quantity * qty
								return (
									<li key={idx} className="flex justify-between">
										<span>{mat?.name ?? 'Unknown'}</span>
										<span>
											Need {need} / Have {mat?.quantity ?? 0} {mat?.unit ?? ''}
										</span>
									</li>
								)
							})}
						</ul>
					</div>
				)}

				{shortages.length > 0 && (
					<div className="rounded-lg border p-3 text-sm text-destructive">
						Cannot fulfill. Short: {shortages.map((s) => s.name).join(', ')}
					</div>
				)}

				<div className="flex justify-end">
					<Button onClick={placeOrder} disabled={!canFulfill || !selected}>Place Order</Button>
				</div>
			</div>

			<div className="grid gap-2">
				{orders.value.length === 0 && <div className="text-sm text-foreground/60">No orders yet.</div>}
				{orders.value.map((o) => {
					const p = products.value.find((x) => x.id === o.productId)
					const editable = canEdit(o)
					return (
						<div key={o.id} className="rounded-lg border p-3 text-sm flex items-center justify-between gap-3">
							<div>
								<div className="font-medium">{p?.name ?? 'Unknown'}</div>
								<div className="text-foreground/60">Qty {o.quantity} • {new Date(o.createdAt).toLocaleString()}</div>
							</div>
							<div className="flex items-center gap-2">
								{editable && (
									<Input
										type="number"
										className="w-24"
										defaultValue={o.quantity}
										onBlur={(e) => editOrderQuantity(o, Number(e.target.value))}
									/>
								)}
								<Button variant="ghost" className="text-destructive" onClick={() => cancelOrder(o)}>Cancel</Button>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

function validateOrder(materials: Material[], product: Product | undefined, qty: number) {
	if (!product || qty <= 0) return { canFulfill: false, shortages: [] as Material[] }
	const shortages: Material[] = []
	for (const b of product.bom) {
		const m = materials.find((x) => x.id === b.materialId)
		if (!m || m.quantity < b.quantity * qty) shortages.push(m ?? { id: b.materialId, name: 'Unknown', unit: '', quantity: 0 })
	}
	return { canFulfill: shortages.length === 0, shortages }
}

function applyMaterialDelta(product: Product, materials: { value: Material[]; setValue: (m: Material[]) => void }, orderQty: number) {
	const delta: Record<string, number> = {}
	for (const b of product.bom) delta[b.materialId] = (delta[b.materialId] ?? 0) + b.quantity * orderQty
	materials.setValue(materials.value.map((m) => ({ ...m, quantity: m.quantity + (delta[m.id] ?? 0) })))
}
