import { AlertTriangle, Clock } from 'lucide-react'
import { useApi } from '../../shared/useApi'
import { listMaterials } from '../../api/materials'
import { listProducts } from '../../api/products'
import { listOrders } from '../../api/orders'
import type { OrderDto, MaterialDto, ProductDto } from '../../api/types'

export function DashboardPage() {
	const materials = useApi<MaterialDto[]>(() => listMaterials(), [])
	const products = useApi<ProductDto[]>(() => listProducts(), [])
	const orders = useApi<OrderDto[]>(() => listOrders(), [])

	const totalMaterials = materials.data?.length ?? 0
	const totalProducts = products.data?.length ?? 0
	const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
	const lowStockList = (materials.data ?? []).filter((m) => m.lowStockThreshold != null && m.quantity <= (m.lowStockThreshold ?? 0)).slice(0, 5)
	const expiringList = (materials.data ?? []).filter((m) => m.expiryDate && new Date(m.expiryDate) <= soon).slice(0, 5)
	const lowStockCount = lowStockList.length
	const expiringSoonCount = expiringList.length

	const activeOrders = (orders.data ?? []).filter((o) => o.status !== 'CANCELLED')
	const series = buildOrdersSeries(activeOrders)

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<Card title="Materials" value={totalMaterials.toString()} subtitle="Total raw materials" />
			<Card title="Products" value={totalProducts.toString()} subtitle="Total finished goods" />
			<Card
				title="Low Stock"
				value={lowStockCount.toString()}
				subtitle="Below thresholds"
				icon={<AlertTriangle className="size-4 text-foreground/70" />}
			/>
			<Card
				title="Expiring Soon"
				value={expiringSoonCount.toString()}
				subtitle="Next 7 days"
				icon={<Clock className="size-4 text-foreground/70" />}
			/>

			<div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div className="rounded-xl border bg-card p-4">
					<div className="text-sm font-medium mb-2">Orders (last 14 days)</div>
					<div className="flex items-end gap-1 h-28">
						{series.map((s) => (
							<div key={s.day} className="flex-1">
								<div className="mx-auto w-4 rounded bg-primary/60" style={{ height: `${s.count === 0 ? 2 : s.count * 10 + 2}px` }} />
								<div className="text-[10px] text-center text-foreground/60 mt-1">{s.day.slice(5)}</div>
							</div>
						))}
					</div>
				</div>
				<div className="grid gap-3">
					<div className="rounded-xl border bg-card p-4">
						<div className="text-sm font-medium mb-2">Low stock</div>
						{lowStockList.length === 0 && <div className="text-sm text-foreground/60">None</div>}
						<ul className="text-sm grid gap-1">
							{lowStockList.map((m) => (
								<li key={m.id} className="flex justify-between">
									<span>{m.name}</span>
									<span>{m.quantity} {m.unit}</span>
								</li>
							))}
						</ul>
					</div>
					<div className="rounded-xl border bg-card p-4">
						<div className="text-sm font-medium mb-2">Expiring soon</div>
						{expiringList.length === 0 && <div className="text-sm text-foreground/60">None</div>}
						<ul className="text-sm grid gap-1">
							{expiringList.map((m) => (
								<li key={m.id} className="flex justify-between">
									<span>{m.name}</span>
									<span>{new Date(m.expiryDate!).toLocaleDateString()}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}

function Card({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon?: React.ReactNode }) {
	return (
		<div className="rounded-xl border bg-card p-4">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm text-foreground/70">{title}</div>
					<div className="text-3xl font-semibold">{value}</div>
					<div className="text-xs text-foreground/60">{subtitle}</div>
				</div>
				{icon}
			</div>
		</div>
	)
}

function buildOrdersSeries(orders: OrderDto[]) {
	const days = [...Array(14)].map((_, i) => {
		const d = new Date()
		d.setDate(d.getDate() - (13 - i))
		const key = d.toISOString().slice(0, 10)
		return key
	})
	const counter: Record<string, number> = {}
	for (const o of orders) {
		const key = new Date(o.createdAt).toISOString().slice(0, 10)
		counter[key] = (counter[key] ?? 0) + 1
	}
	return days.map((key) => ({ day: key, count: counter[key] ?? 0 }))
}
