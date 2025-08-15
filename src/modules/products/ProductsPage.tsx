import { useMemo, useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { useLocalStore } from '../../shared/useLocalStore'
import type { BomItem, Material, Product } from '../inventory/types'
import { Plus, Trash2, Save, X } from 'lucide-react'

const empty: Product = { id: '', name: '', unit: 'pack', quantity: 0, bom: [] }

export function ProductsPage() {
	const materials = useLocalStore<Material[]>('materials', [])
	const store = useLocalStore<Product[]>('products', [])
	const [form, setForm] = useState<Product>(empty)
	const [bomItem, setBomItem] = useState<BomItem>({ materialId: '', quantity: 0 })

	const productUnits = ['pack', 'pcs']

	const isEditing = Boolean(form.id)

	function resetForm() {
		setForm(empty)
		setBomItem({ materialId: '', quantity: 0 })
	}

	function addOrUpdateProduct() {
		if (!form.name.trim()) return
		const id = form.id || crypto.randomUUID()
		const item: Product = { ...form, id }
		const next = store.value.some((p) => p.id === id)
			? store.value.map((p) => (p.id === id ? item : p))
			: [...store.value, item]
		store.setValue(next)
		resetForm()
	}

	function removeProduct(id: string) {
		store.setValue(store.value.filter((p) => p.id !== id))
	}

	function addBomItem() {
		if (!bomItem.materialId || bomItem.quantity <= 0) return
		setForm({ ...form, bom: [...form.bom, bomItem] })
		setBomItem({ materialId: '', quantity: 0 })
	}

	const sorted = useMemo(() => [...store.value].sort((a, b) => a.name.localeCompare(b.name)), [store.value])

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Products</h2>
			<div className="grid gap-3 rounded-xl border p-4 bg-card">
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div>
						<Label htmlFor="name">Name</Label>
						<Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
					</div>
					<div>
						<Label htmlFor="unit">Unit</Label>
						<select
							id="unit"
							className="h-9 w-full rounded-md border bg-background px-2 text-sm"
							value={form.unit}
							onChange={(e) => setForm({ ...form, unit: e.target.value })}
						>
							{productUnits.map((u) => (
								<option key={u}>{u}</option>
							))}
						</select>
					</div>
					<div>
						<Label htmlFor="qty">Quantity</Label>
						<Input
							id="qty"
							type="number"
							value={form.quantity}
							onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
					<div className="sm:col-span-2">
						<Label>Material</Label>
						<select
							className="h-9 w-full rounded-md border bg-background px-2 text-sm"
							value={bomItem.materialId}
							onChange={(e) => setBomItem({ ...bomItem, materialId: e.target.value })}
						>
							<option value="">Select material</option>
							{materials.value.map((m) => (
								<option key={m.id} value={m.id}>
									{m.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<Label>Qty per product</Label>
						<Input
							type="number"
							value={bomItem.quantity}
							onChange={(e) => setBomItem({ ...bomItem, quantity: Number(e.target.value) })}
						/>
					</div>
					<div className="flex items-end">
						<Button onClick={addBomItem} className="inline-flex items-center gap-2">
							<Plus className="size-4" /> Add to BOM
						</Button>
					</div>
				</div>

				{form.bom.length > 0 && (
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium mb-2">BOM</div>
						<ul className="grid gap-2">
							{form.bom.map((b, idx) => {
								const mat = materials.value.find((m) => m.id === b.materialId)
								return (
									<li key={idx} className="flex items-center justify-between gap-2 text-sm">
										<span className="min-w-0 flex-1 truncate">
											{mat?.name ?? 'Unknown'}
										</span>
										<Input
											type="number"
											className="w-24"
											value={b.quantity}
											onChange={(e) => {
												const q = Number(e.target.value)
												setForm({
													...form,
													bom: form.bom.map((x, i) => (i === idx ? { ...x, quantity: q } : x)),
												})
											}}
										/>
										<Button
											variant="ghost"
											className="text-destructive inline-flex items-center gap-1"
											onClick={() => setForm({ ...form, bom: form.bom.filter((_, i) => i !== idx) })}
										>
											<Trash2 className="size-4" /> Remove
										</Button>
									</li>
								)
							})}
						</ul>
					</div>
				)}

				<div className="flex justify-end items-center gap-2">
					{isEditing && (
						<Button variant="ghost" onClick={resetForm} className="inline-flex items-center gap-2">
							<X className="size-4" /> Cancel
						</Button>
					)}
					<Button onClick={addOrUpdateProduct} className="inline-flex items-center gap-2">
						{isEditing ? <Save className="size-4" /> : <Plus className="size-4" />}
						{isEditing ? 'Save' : 'Add'}
					</Button>
				</div>
			</div>

			<div className="grid gap-2">
				{sorted.length === 0 && <div className="text-sm text-foreground/60">No products yet.</div>}
				{sorted.map((p) => (
					<div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
						<div className="space-y-0.5">
							<div className="font-medium">{p.name}</div>
							<div className="text-xs text-foreground/60">
								{p.quantity} {p.unit} • {p.bom.length} material(s)
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={() => setForm(p)}>Edit</Button>
							<Button variant="ghost" onClick={() => removeProduct(p.id)} className="text-destructive inline-flex items-center gap-1">
								<Trash2 className="size-4" /> Delete
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
