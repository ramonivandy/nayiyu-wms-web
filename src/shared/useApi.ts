import { useCallback, useEffect, useState } from 'react'

export function useApi<T>(fetcher: () => Promise<T>, deps: React.DependencyList = []) {
        const [data, setData] = useState<T | null>(null)
        const [loading, setLoading] = useState(false)
        const [error, setError] = useState<unknown>(null)

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [fetcher, ...deps])

        useEffect(() => {
                run()
        }, [run])

        return { data, loading, error, refetch: run, setData }
}
