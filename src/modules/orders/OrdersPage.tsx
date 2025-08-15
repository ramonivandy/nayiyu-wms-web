import { useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { useApi } from '../../shared/useApi'
import { listProducts } from '../../api/products'
import { cancelOrder, completeOrder, createOrder, listOrders, updateOrderItemQuantity } from '../../api/orders'
import type { OrderDto, ProductDto } from '../../api/types'
import { useToast } from '../../shared/toast/ToastProvider'
import { humanizeApiError } from '../../api/client'

export type Order = OrderDto

const EDIT_WINDOW_MS = 5 * 60 * 1000

export function OrdersPage() {
	const products = useApi<ProductDto[]>(() => listProducts(), [])
	const orders = useApi<OrderDto[]>(() => listOrders(), [])
	const { success, error } = useToast()
	const [productId, setProductId] = useState<string>('')
	const [qty, setQty] = useState<number>(1)
	const [draftItems, setDraftItems] = useState<Array<{ productId: string; quantity: number }>>([])

	const selected = products.data?.find((p) => p.id === productId)

	function addDraftItem() {
		if (!productId || qty <= 0) return
		setDraftItems((prev) => {
			const idx = prev.findIndex((i) => i.productId === productId)
			if (idx >= 0) {
				const next = [...prev]
				next[idx] = { ...next[idx], quantity: next[idx].quantity + qty }
				return next
			}
			return [...prev, { productId, quantity: qty }]
		})
		setProductId('')
		setQty(1)
	}

	async function placeOrder() {
		if (draftItems.length === 0) return
		try {
			await createOrder({ orderDate: new Date().toISOString(), items: draftItems })
			success('Order placed')
			await orders.refetch()
			setProductId('')
			setQty(1)
			setDraftItems([])
		} catch (e: any) {
			error(humanizeApiError(e))
		}
	}

	function canEdit(order: OrderDto) {
		return order.status !== 'CANCELLED' && Date.now() - new Date(order.createdAt).getTime() <= EDIT_WINDOW_MS
	}

	async function handleEditQty(order: OrderDto, itemId: string, newQty: number) {
		if (newQty <= 0) return
		try {
			await updateOrderItemQuantity(order.id, itemId, newQty)
			success('Order updated')
			await orders.refetch()
		} catch (e: any) {
			error(humanizeApiError(e))
		}
	}

	async function handleCancel(order: OrderDto) {
		try {
			await cancelOrder(order.id)
			success('Order cancelled')
			await orders.refetch()
		} catch (e: any) {
			error(humanizeApiError(e))
		}
	}

	async function handleComplete(order: OrderDto) {
		try {
			await completeOrder(order.id)
			success('Order completed')
			await orders.refetch()
		} catch (e: any) {
			error(humanizeApiError(e))
		}
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
							{(products.data ?? []).map((p) => (
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

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={addDraftItem} disabled={!productId || qty <= 0}>+ Add to list</Button>
					<Button onClick={placeOrder} disabled={draftItems.length === 0}>Place Order</Button>
				</div>

				{draftItems.length > 0 && (
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium mb-2">Items</div>
						<ul className="grid gap-2">
							{draftItems.map((it, idx) => {
								const p = (products.data ?? []).find((x) => x.id === it.productId)
								return (
									<li key={idx} className="flex items-center justify-between text-sm">
										<span className="truncate">{p?.name ?? 'Unknown'}</span>
										<div className="flex items-center gap-2">
											<Input
												type="number"
												className="w-24"
												value={it.quantity}
												onChange={(e) => {
													const q = Number(e.target.value)
													setDraftItems((prev) => prev.map((x, i) => (i === idx ? { ...x, quantity: q } : x)))
												}}
											/>
											<Button variant="ghost" className="text-destructive" onClick={() => setDraftItems((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
										</div>
									</li>
								)
							})}
						</ul>
					</div>
				)}
			</div>

			<div className="grid gap-2">
				{(orders.data ?? []).length === 0 && <div className="text-sm text-foreground/60">No orders yet.</div>}
				{(orders.data ?? []).map((o) => {
					const cancelled = o.status === 'CANCELLED'
					return (
						<div key={o.id} className="rounded-lg border p-3 grid gap-2">
							<div className="flex items-center justify-between text-sm">
								<div className="font-medium">Order • {new Date(o.createdAt).toLocaleString()}</div>
								<div className="flex items-center gap-2">
									{cancelled ? (
										<span className="text-foreground/60">Cancelled</span>
									) : (
										<>
											<Button variant="outline" onClick={() => handleComplete(o)}>Complete</Button>
											<Button variant="ghost" className="text-destructive" onClick={() => handleCancel(o)}>Cancel</Button>
										</>
									)}
								</div>
							</div>
							<ul className="grid gap-2">
								{o.items.map((it) => (
									<li key={it.id} className="flex items-center justify-between text-sm">
										<span className="truncate">
											{it.productNameSnapshot || it.product?.name || 'Unknown'}
										</span>
										<div className="flex items-center gap-2">
											{!cancelled && canEdit(o) ? (
												<Input type="number" className="w-24" defaultValue={it.quantity} onBlur={(e) => handleEditQty(o, it.id, Number(e.target.value))} />
											) : (
												<span className="text-foreground/60">Qty {it.quantity}</span>
											)}
										</div>
									</li>
								))}
							</ul>
						</div>
					)
				})}
			</div>
		</div>
	)
}
