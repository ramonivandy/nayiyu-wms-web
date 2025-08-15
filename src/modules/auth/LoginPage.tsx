import { useState } from 'react'
import { Input } from '../../shared/ui/Input'
import { Button } from '../../shared/ui/Button'
import { Label } from '../../shared/ui/Label'
import { useNavigate } from 'react-router-dom'
import { apiLogin } from '../../api/auth'

export function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string>('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!email || !password) return
		setLoading(true)
		setError('')
		try {
			const { token } = await apiLogin(email, password)
			localStorage.setItem('authToken', token)
			navigate('/')
		} catch (err: any) {
			setError(err?.message ?? 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen grid place-items-center">
			<form onSubmit={submit} className="w-full max-w-sm rounded-xl border bg-card p-6 grid gap-3">
				<h1 className="text-xl font-semibold text-center">Sign in</h1>
				{error && <div className="text-sm text-destructive">{error}</div>}
				<div>
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
				</div>
				<div>
					<Label htmlFor="password">Password</Label>
					<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				</div>
				<Button type="submit" className="mt-2" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</Button>
			</form>
		</div>
	)
}
