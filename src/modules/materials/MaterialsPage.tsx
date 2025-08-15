import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Plus, Trash2, Save, X } from 'lucide-react'
import { useApi } from '../../shared/useApi'
import { createMaterial, deleteMaterial, listMaterials, updateMaterial } from '../../api/materials'
import type { MaterialDto } from '../../api/types'
import { useToast } from '../../shared/toast/ToastProvider'
import { humanizeApiError } from '../../api/client'

const empty = { id: '', name: '', unit: 'pcs', quantity: 0, lowStockThreshold: 0, expiryDate: '' }

type FormState = typeof empty

export function MaterialsPage() {
	const { data, loading, error, refetch } = useApi<MaterialDto[]>(() => listMaterials(), [])
	const { success, error: toastError } = useToast()
	const [form, setForm] = useState<FormState>({ ...empty })

	const units = ['pcs', 'gram', 'kg', 'ml', 'liter', 'pack']
	const isEditing = Boolean(form.id)

	useEffect(() => {
		// ensure list is loaded initially
	}, [])

	function resetForm() {
		setForm({ ...empty })
	}

	async function save() {
		if (!form.name.trim()) return toastError('Name is required')
		try {
			if (isEditing) {
				await updateMaterial(form.id, {
					name: form.name,
					quantity: Number(form.quantity) || 0,
					unit: form.unit,
					expiryDate: form.expiryDate || undefined,
					lowStockThreshold: form.lowStockThreshold || 0,
				})
				success('Material updated')
			} else {
				await createMaterial({
					name: form.name,
					quantity: Number(form.quantity) || 0,
					unit: form.unit,
					expiryDate: form.expiryDate || undefined,
					lowStockThreshold: form.lowStockThreshold || 0,
				})
				success('Material created')
			}
			await refetch()
			resetForm()
		} catch (e: any) {
			toastError(humanizeApiError(e))
		}
	}

	async function remove(id: string) {
		try {
			await deleteMaterial(id)
			success('Material deleted')
			await refetch()
		} catch (e: any) {
			toastError(humanizeApiError(e))
		}
	}

	const sorted = useMemo(() => (data ? [...data].sort((a, b) => a.name.localeCompare(b.name)) : []), [data])

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Materials</h2>
			<div className="grid gap-3 rounded-xl border p-4 bg-card">
				{error && <div className="text-sm text-destructive">Failed to load materials</div>}
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
							{units.map((u) => (
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
					<div>
						<Label htmlFor="threshold">Low-stock threshold</Label>
						<Input
							id="threshold"
							type="number"
							value={form.lowStockThreshold}
							onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
						/>
					</div>
					<div className="sm:col-span-2">
						<Label htmlFor="expiry">Expiry</Label>
						<div className="relative">
							<input
								id="expiry"
								type="date"
								value={form.expiryDate}
								onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
								className="h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							/>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end gap-2">
					{isEditing && (
						<Button variant="ghost" onClick={resetForm} className="inline-flex items-center gap-2">
							<X className="size-4" /> Cancel
						</Button>
					)}
					<Button onClick={save} disabled={loading} className="inline-flex items-center gap-2">
						{isEditing ? <Save className="size-4" /> : <Plus className="size-4" />}
						{isEditing ? 'Save' : 'Add'}
					</Button>
				</div>
			</div>

			<div className="grid gap-2">
				{!loading && sorted.length === 0 && <div className="text-sm text-foreground/60">No materials yet.</div>}
				{sorted.map((m) => (
					<div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
						<div className="space-y-0.5">
							<div className="font-medium">{m.name}</div>
							<div className="text-xs text-foreground/60">
								{m.quantity} {m.unit}
								{m.lowStockThreshold != null && ` • threshold ${m.lowStockThreshold}`}
								{m.expiryDate && ` • exp ${new Date(m.expiryDate).toLocaleDateString()}`}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={() => setForm({
								id: m.id,
								name: m.name,
								unit: m.unit,
								quantity: m.quantity,
								lowStockThreshold: m.lowStockThreshold ?? 0,
								expiryDate: m.expiryDate ?? ''
							})}>Edit</Button>
							<Button variant="ghost" onClick={() => remove(m.id)} className="text-destructive inline-flex items-center gap-1">
								<Trash2 className="size-4" /> Delete
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
