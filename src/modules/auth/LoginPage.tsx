import { useState } from 'react'
import { Input } from '../../shared/ui/Input'
import { Button } from '../../shared/ui/Button'
import { Label } from '../../shared/ui/Label'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate()

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!email || !password) return
		// TODO: replace with real API call and use returned token
		const fakeJwt = 'demo-token.' + btoa(email) + '.sig'
		localStorage.setItem('authToken', fakeJwt)
		navigate('/')
	}

	return (
		<div className="min-h-screen grid place-items-center">
			<form onSubmit={submit} className="w-full max-w-sm rounded-xl border bg-card p-6 grid gap-3">
				<h1 className="text-xl font-semibold text-center">Sign in</h1>
				<div>
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
				</div>
				<div>
					<Label htmlFor="password">Password</Label>
					<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				</div>
				<Button type="submit" className="mt-2">Login</Button>
			</form>
		</div>
	)
}
