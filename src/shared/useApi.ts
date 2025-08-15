import { useCallback, useEffect, useState } from 'react'

export function useApi<T>(fetcher: () => Promise<T>, deps: any[] = []) {
	const [data, setData] = useState<T | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<any>(null)

	const run = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetcher()
			setData(res)
		} catch (e) {
			setError(e)
		} finally {
			setLoading(false)
		}
	}, deps)

	useEffect(() => {
		run()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)

	return { data, loading, error, refetch: run, setData }
}
