import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AppLayout } from './modules/layout/AppLayout'
import { DashboardPage } from './modules/dashboard/DashboardPage'
import { MaterialsPage } from './modules/materials/MaterialsPage'
import { ProductsPage } from './modules/products/ProductsPage'
import { OrdersPage } from './modules/orders/OrdersPage'
import { ProductionCalculatorPage } from './modules/production/ProductionCalculatorPage'
import { LoginPage } from './modules/auth/LoginPage'
import { RequireAuth } from './modules/auth/RequireAuth'

const router = createBrowserRouter([
	{ path: '/login', element: <LoginPage /> },
	{
		path: '/',
		element: <RequireAuth />,
		children: [
			{
				path: '/',
				element: <AppLayout />,
				children: [
					{ index: true, element: <DashboardPage /> },
					{ path: 'materials', element: <MaterialsPage /> },
					{ path: 'products', element: <ProductsPage /> },
					{ path: 'orders', element: <OrdersPage /> },
					{ path: 'production-calculator', element: <ProductionCalculatorPage /> },
				],
			},
		],
	},
])

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
