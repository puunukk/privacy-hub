import { call, put, all } from 'redux-saga/effects'

import { fetchContainers } from '@/api/fetchContainers'
import { fetchDockerInfo } from '@/api/fetchDockerInfo'
import { fetchContainerStats } from '@/api/fetchContainerStats'
import {
    fetchContainersSuccess,
    fetchDockerInfoSuccess,
    setConnectionStatus
} from '@/store/docker/containerSlice'

import { calculateCpuPercent } from '@/utils/calculateCpuPercent'
import { calculateMemoryPercent } from '@/utils/calculateMemoryPercent'
import { formatBytes } from '@/utils/formatBytes'
import type { ContainerWithStats } from './types'

function* fetchContainersSaga(): Generator<any, void, any> {
    console.log('fetchContainersSaga started')
    try {
        const [containers, dockerInfo]: [any[], any | null] = yield all([
            call(fetchContainers),
            call(fetchDockerInfo),
        ])
        console.log('Docker data received - containers:', containers?.length, 'dockerInfo:', dockerInfo)

        // Fetch stats for running containers
        const containersWithStats: ContainerWithStats[] = yield all(
            containers.map(function* (container) {
                if (container.State === 'running') {
                    try {
                        const stats: any = yield call(fetchContainerStats, container.Id)
                        console.log('Container stats for', container.Names[0], stats)

                        if (stats) {
                            const cpuPercent = calculateCpuPercent(stats)
                            const memPercent = calculateMemoryPercent(stats)

                            // Try to get memory usage from different fields
                            let memUsage = stats.memory_stats?.usage || 0

                            // If usage is 0, try to calculate from stats fields
                            if (memUsage === 0 && stats.memory_stats?.stats) {
                                const memStats = stats.memory_stats.stats
                                // Try different memory fields that might be available
                                memUsage = memStats.anon || memStats.active_anon || memStats.file || 0
                            }

                            console.log('Calculated stats:', { cpuPercent, memPercent, memUsage, rawMemStats: stats.memory_stats })

                            return {
                                ...container,
                                cpuUsage: `${cpuPercent.toFixed(1)}%`,
                                memUsage: memUsage > 0 ? `${formatBytes(memUsage)} (${memPercent.toFixed(1)}%)` : 'N/A'
                            }
                        }
                    } catch (error) {
                        console.error('Stats fetch failed for', container.Names[0], error)
                    }
                }
                return container
            })
        )

        const timestamp = Date.now()

        yield put(fetchContainersSuccess({ containers: containersWithStats, timestamp }))
        if (dockerInfo) {
            yield put(fetchDockerInfoSuccess({ dockerInfo, timestamp }))
        }

        // Consider connected if we got any data, even if partial
        const isConnected = containersWithStats.length > 0 || dockerInfo !== null
        yield put(setConnectionStatus({ isConnected }))

    } catch (error) {
        const timestamp = Date.now()
        // const errorMessage = error instanceof Error ? error.message : 'Docker API unavailable'

        // Still provide empty containers array for UI to work
        yield put(fetchContainersSuccess({ containers: [], timestamp }))
        yield put(setConnectionStatus({ isConnected: false }))
    }
}

export { fetchContainersSaga }
