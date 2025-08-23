import { call, put, fork, take, all } from 'redux-saga/effects'

import { fetchContainers } from '@/api/fetchContainers'
import { fetchDockerInfo } from '@/api/fetchDockerInfo'
import { fetchContainerStats } from '@/api/fetchContainerStats'
import {
    fetchContainersSuccess,
    fetchDockerInfoSuccess,
    setConnectionStatus,
    setLoadingStatus
} from '@/store/docker/containerSlice'
import { ContainerActionTypes } from '@/store/docker/types'

import { calculateCpuPercent } from '@/utils/calculateCpuPercent'
import { calculateMemoryPercent } from '@/utils/calculateMemoryPercent'
import { formatBytes } from '@/utils/formatBytes'
import { logger } from '@/utils/logger'
import type { ContainerWithStats } from './types'

// Main Docker data loading saga
function* loadDockerDataSaga(): Generator<any, void, any> {
    logger.debug('loadDockerDataSaga started')
    logger.time('Docker data fetch')

    try {
        yield put(setLoadingStatus(true))

        // Fetch containers and Docker info in parallel
        const [containers, dockerInfo]: [any[], any | null] = yield all([
            call(fetchContainers),
            call(fetchDockerInfo),
        ])

        logger.debug('Docker data received', { containerCount: containers?.length, hasDockerInfo: !!dockerInfo })

        // Fetch stats for running containers
        const containersWithStats: ContainerWithStats[] = yield all(
            containers.map(function* (container) {
                if (container.State === 'running') {
                    try {
                        const stats: any = yield call(fetchContainerStats, container.Id)
                        logger.debug('Container stats fetched', { name: container.Names[0], hasStats: !!stats })

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

                            logger.debug('Calculated container stats', { 
                                name: container.Names[0], 
                                cpuPercent, 
                                memPercent, 
                                memUsage: formatBytes(memUsage) 
                            })

                            return {
                                ...container,
                                cpuUsage: `${cpuPercent.toFixed(1)}%`,
                                memUsage: memUsage > 0 ? `${formatBytes(memUsage)} (${memPercent.toFixed(1)}%)` : 'N/A'
                            }
                        }
                    } catch (error) {
                        logger.debug('Stats fetch failed for container:', container.Names[0], error)
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
        
        logger.debug('Docker data loading completed', { containerCount: containersWithStats.length, isConnected })
        logger.timeEnd('Docker data fetch')

    }
    catch (error) {
        logger.error('loadDockerDataSaga error:', error)
        logger.timeEnd('Docker data fetch')
        const timestamp = Date.now()

        // Still provide empty containers array for UI to work
        yield put(fetchContainersSuccess({ containers: [], timestamp }))
        yield put(setConnectionStatus({ isConnected: false }))
    }
    finally {
        yield put(setLoadingStatus(false))
    }
}

// Watcher saga that listens for load requests
function* watchLoadDockerData(): Generator {
    while (true) {
        yield take(ContainerActionTypes.LOAD_DOCKER_DATA_REQUEST)
        yield fork(loadDockerDataSaga)
    }
}

// Auto-refresh saga that can be controlled
function* autoRefreshSaga(): Generator {
    while (true) {
        // Wait for auto-refresh to be enabled
        yield take(ContainerActionTypes.START_AUTO_REFRESH)

        while (true) {
            // Wait for the specified interval
            yield take(ContainerActionTypes.AUTO_REFRESH_TICK)

            // Load fresh data
            yield fork(loadDockerDataSaga)
        }
    }
}

// Main Docker saga that orchestrates everything
export default function* dockerSaga(): Generator {
    logger.info('dockerSaga started')

    // Fork the watchers - they will run concurrently
    yield fork(watchLoadDockerData)
    yield fork(autoRefreshSaga)
}
