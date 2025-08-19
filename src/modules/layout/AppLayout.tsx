import { Outlet, NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, Package2, Soup, ClipboardList, Calculator } from 'lucide-react'
import type { ReactNode } from 'react'
import { apiLogout } from '../../api/auth'

export function AppLayout() {
	const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        async function logout() {
                try {
                        await apiLogout()
                } catch {
                        // ignore logout errors
                }
                localStorage.removeItem('authToken')
                location.href = '/login'
        }
	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="sticky top-0 z-40 border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
				<div className="container-base flex h-14 items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="size-6 rounded-md bg-primary" />
						<span className="font-semibold tracking-tight">Pesenin!</span>
					</div>
					<nav className="hidden sm:flex items-center gap-3">
						<ul className="list-none m-0 p-1 flex items-center gap-1 rounded-xl border bg-card/60">
							<Nav to="/" label="Dashboard" icon={<LayoutDashboard className="size-4" />} />
							<Nav to="/materials" label="Materials" icon={<Soup className="size-4" />} />
							<Nav to="/products" label="Products" icon={<Package2 className="size-4" />} />
							<Nav to="/orders" label="Orders" icon={<ClipboardList className="size-4" />} />
							<Nav to="/production-calculator" label="Production" icon={<Calculator className="size-4" />} />
						</ul>
						{token ? (
							<button onClick={logout} className="text-sm text-foreground/70 hover:underline">Logout</button>
						) : (
							<Link to="/login" className="text-sm text-foreground/70 hover:underline">Login</Link>
						)}
					</nav>
				</div>
			</header>

			<main className="container-base py-4">
				<Outlet />
			</main>

			<nav className="sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 rounded-xl border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-md">
				<ul className="list-none flex items-center gap-1 p-1">
					<Nav to="/" label="Home" icon={<LayoutDashboard className="size-4" />} />
					<Nav to="/materials" label="Materials" icon={<Soup className="size-4" />} />
					<Nav to="/products" label="Products" icon={<Package2 className="size-4" />} />
					<Nav to="/orders" label="Orders" icon={<ClipboardList className="size-4" />} />
					<Nav to="/production-calculator" label="Calc" icon={<Calculator className="size-4" />} />
				</ul>
			</nav>
		</div>
	)
}

function Nav({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
	return (
		<li>
			<NavLink
				to={to}
				className={({ isActive }) =>
					`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/20 ${
						isActive ? 'bg-primary/30 text-foreground shadow-sm' : 'text-foreground/80'
					}`
				}
			>
				{icon}
				<span className="hidden sm:inline">{label}</span>
			</NavLink>
		</li>
	)
}
