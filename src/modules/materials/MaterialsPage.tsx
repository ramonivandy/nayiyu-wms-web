import { useMemo, useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { useLocalStore } from '../../shared/useLocalStore'
import type { Material } from '../inventory/types'
import { Plus, Trash2, Save, X } from 'lucide-react'

const empty: Material = { id: '', name: '', unit: 'pcs', quantity: 0 }

export function MaterialsPage() {
	const store = useLocalStore<Material[]>('materials', [])
	const [form, setForm] = useState<Material>({ ...empty })
	const [expiry, setExpiry] = useState<string>('')

	const units = ['pcs', 'gram', 'kg', 'ml', 'liter', 'pack']

	const isEditing = Boolean(form.id)

	function resetForm() {
		setForm({ ...empty })
		setExpiry('')
	}

	function save() {
		if (!form.name.trim()) return
		const id = form.id || crypto.randomUUID()
		const item: Material = { ...form, id, expiry: expiry || undefined }
		const next = store.value.some((m) => m.id === id)
			? store.value.map((m) => (m.id === id ? item : m))
			: [...store.value, item]
		store.setValue(next)
		resetForm()
	}

	function remove(id: string) {
		store.setValue(store.value.filter((m) => m.id !== id))
	}

	const sorted = useMemo(() => [...store.value].sort((a, b) => a.name.localeCompare(b.name)), [store.value])

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Materials</h2>
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
							value={form.threshold ?? 0}
							onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })}
						/>
					</div>
					<div className="sm:col-span-2">
						<Label htmlFor="expiry">Expiry</Label>
						<Input id="expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
					</div>
				</div>
				<div className="flex items-center justify-end gap-2">
					{isEditing && (
						<Button variant="ghost" onClick={resetForm} className="inline-flex items-center gap-2">
							<X className="size-4" /> Cancel
						</Button>
					)}
					<Button onClick={save} className="inline-flex items-center gap-2">
						{isEditing ? <Save className="size-4" /> : <Plus className="size-4" />}
						{isEditing ? 'Save' : 'Add'}
					</Button>
				</div>
			</div>

			<div className="grid gap-2">
				{sorted.length === 0 && <div className="text-sm text-foreground/60">No materials yet.</div>}
				{sorted.map((m) => (
					<div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
						<div className="space-y-0.5">
							<div className="font-medium">{m.name}</div>
							<div className="text-xs text-foreground/60">
								{m.quantity} {m.unit}
								{m.threshold != null && ` • threshold ${m.threshold}`}
								{m.expiry && ` • exp ${new Date(m.expiry).toLocaleDateString()}`}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={() => { setForm(m); setExpiry(m.expiry ?? '') }}>Edit</Button>
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
