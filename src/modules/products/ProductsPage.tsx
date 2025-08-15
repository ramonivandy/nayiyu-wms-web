import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Plus, Trash2, Save, X } from 'lucide-react'
import { useApi } from '../../shared/useApi'
import { listMaterials } from '../../api/materials'
import { createProduct, deleteProduct, getProductWithBom, listProducts, setProductBom, updateProduct } from '../../api/products'
import type { MaterialDto, ProductDto } from '../../api/types'
import { useToast } from '../../shared/toast/ToastProvider'

type BomDraftItem = { materialId: string; quantityPerPortion: number }
const emptyProduct = { id: '', name: '', unit: 'pack', bom: [] as BomDraftItem[] }

export function ProductsPage() {
	const materialsQuery = useApi<MaterialDto[]>(() => listMaterials(), [])
	const productsQuery = useApi<ProductDto[]>(() => listProducts(), [])
	const { success, error } = useToast()
	const [form, setForm] = useState<typeof emptyProduct>(emptyProduct)
	const [bomItem, setBomItem] = useState<BomDraftItem>({ materialId: '', quantityPerPortion: 0 })

	const isEditing = Boolean(form.id)

	function resetForm() {
		setForm(emptyProduct)
		setBomItem({ materialId: '', quantityPerPortion: 0 })
	}

	async function addOrUpdateProduct() {
		if (!form.name.trim()) return
		try {
			let productId = form.id
			if (isEditing) {
				await updateProduct(productId, { name: form.name })
				success('Product updated')
			} else {
				const created = await createProduct({ name: form.name })
				productId = created.id
				success('Product created')
			}
			if (form.bom.length > 0) {
				await setProductBom(productId, form.bom.map((b) => ({ materialId: b.materialId, quantityPerPortion: b.quantityPerPortion })))
			}
			await productsQuery.refetch()
			resetForm()
		} catch (e: any) {
			error(e?.message ?? 'Failed to save product')
		}
	}

	async function editExistingProduct(p: ProductDto) {
		try {
			const full = await getProductWithBom(p.id)
			setForm({
				id: full.id,
				name: full.name,
				unit: 'pack',
				bom: (full.bomItems ?? full.bom ?? []).map((x: any) => ({ materialId: x.materialId, quantityPerPortion: x.quantityPerPortion })),
			})
		} catch (e: any) {
			error(e?.message ?? 'Failed to load product')
		}
	}

	async function removeProduct(productId: string) {
		try {
			await deleteProduct(productId)
			success('Product deleted')
			await productsQuery.refetch()
		} catch (e: any) {
			error(e?.message ?? 'Failed to delete product')
		}
	}

	function addBomItem() {
		if (!bomItem.materialId || bomItem.quantityPerPortion <= 0) return
		setForm({ ...form, bom: [...form.bom, bomItem] })
		setBomItem({ materialId: '', quantityPerPortion: 0 })
	}

	const sorted = useMemo(() => (productsQuery.data ? [...productsQuery.data].sort((a, b) => a.name.localeCompare(b.name)) : []), [productsQuery.data])

	function countMaterials(p: ProductDto) {
		return (p.bomItems?.length ?? p.bom?.length ?? 0)
	}

	function materialUnit(id: string) {
		const m = (materialsQuery.data ?? []).find((x) => x.id === id)
		return m?.unit ? ` ${m.unit}` : ''
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Products</h2>
			<div className="grid gap-3 rounded-xl border p-4 bg-card">
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
							{['pack', 'pcs'].map((u) => (
								<option key={u}>{u}</option>
							))}
						</select>
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
							{(materialsQuery.data ?? []).map((m) => (
								<option key={m.id} value={m.id}>
									{m.name} ({m.unit})
								</option>
							))}
						</select>
					</div>
					<div>
						<Label>Qty per product</Label>
						<Input
							type="number"
							value={bomItem.quantityPerPortion}
							onChange={(e) => setBomItem({ ...bomItem, quantityPerPortion: Number(e.target.value) })}
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
								const mat = (materialsQuery.data ?? []).find((m) => m.id === b.materialId)
								return (
									<li key={idx} className="flex items-center justify-between gap-2 text-sm">
										<span className="min-w-0 flex-1 truncate">
											{mat?.name ?? 'Unknown'}{materialUnit(b.materialId)}
										</span>
										<Input
											type="number"
											className="w-24"
											value={b.quantityPerPortion}
											onChange={(e) => {
												const q = Number(e.target.value)
												setForm({
													...form,
													bom: form.bom.map((x, i) => (i === idx ? { ...x, quantityPerPortion: q } : x)),
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
							<div className="text-xs text-foreground/60">{countMaterials(p)} material(s)</div>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={() => editExistingProduct(p)}>Edit</Button>
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
