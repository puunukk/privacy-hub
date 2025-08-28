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
import { calculateMemoryUsage, getMemoryLimit } from '@/utils/calculateMemoryUsage'
import { formatBytes } from '@/utils/systemUtils'
import { logger } from '@/utils/logger'
import { debugDockerStats } from '@/utils/debugDockerStats'
import type { ContainerWithStats } from './types'

// Containers-only loading saga (with stats)
function* loadContainersSaga(): Generator<any, void, any> {
    const timerId = `Containers fetch ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    logger.debug('loadContainersSaga started')
    logger.time(timerId)

    try {
        yield put(setLoadingStatus(true))

        // Fetch containers only
        const containers: any[] = yield call(fetchContainers)
        logger.debug('Containers data received', { containerCount: containers?.length })

        // Fetch stats for running containers
        const containersWithStats: ContainerWithStats[] = yield all(
            containers.map(function* (container) {
                if (container.State === 'running') {
                    try {
                        const stats: any = yield call(fetchContainerStats, container.Id)
                        logger.debug('Container stats fetched', { name: container.Names[0], hasStats: !!stats })

                        if (stats) {
                            // Debug raw stats in development
                            debugDockerStats(container.Names[0], stats)
                            
                            const cpuPercent = calculateCpuPercent(stats)
                            
                            // Use improved memory calculation that handles cgroup v2
                            const memUsage = calculateMemoryUsage(stats)
                            const memLimit = getMemoryLimit(stats)
                            const memPercent = memLimit > 0 ? (memUsage / memLimit) * 100 : 0

                            logger.debug('Calculated container stats', { 
                                name: container.Names[0], 
                                cpuPercent: cpuPercent.toFixed(1), 
                                memUsage: formatBytes(memUsage),
                                memPercent: memPercent.toFixed(1),
                                memLimit: formatBytes(memLimit),
                                rawMemStats: stats.memory_stats
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
        
        // Consider connected if we got containers
        const isConnected = containersWithStats.length > 0
        yield put(setConnectionStatus({ isConnected }))
        
        logger.debug('Containers loading completed', { containerCount: containersWithStats.length, isConnected })

    } catch (error) {
        logger.error('loadContainersSaga error:', error)
        const timestamp = Date.now()

        // Still provide empty containers array for UI to work
        yield put(fetchContainersSuccess({ containers: [], timestamp }))
        yield put(setConnectionStatus({ isConnected: false }))
    } finally {
        yield put(setLoadingStatus(false))
        logger.timeEnd(timerId)
    }
}

// Docker info only loading saga
function* loadDockerInfoSaga(): Generator<any, void, any> {
    const timerId = `Docker info fetch ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    logger.debug('loadDockerInfoSaga started')
    logger.time(timerId)

    try {
        // Fetch Docker info only
        const dockerInfo: any = yield call(fetchDockerInfo)
        logger.debug('Docker info received', { hasDockerInfo: !!dockerInfo })

        if (dockerInfo) {
            const timestamp = Date.now()
            yield put(fetchDockerInfoSuccess({ dockerInfo, timestamp }))
        }
        
        logger.debug('Docker info loading completed')

    } catch (error) {
        logger.error('loadDockerInfoSaga error:', error)
    } finally {
        logger.timeEnd(timerId)
    }
}

// Combined Docker data loading saga (legacy)
function* loadDockerDataSaga(): Generator<any, void, any> {
    const timerId = `Docker data fetch ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    logger.debug('loadDockerDataSaga started')
    logger.time(timerId)

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
                            // Debug raw stats in development
                            debugDockerStats(container.Names[0], stats)
                            
                            const cpuPercent = calculateCpuPercent(stats)
                            
                            // Use improved memory calculation that handles cgroup v2
                            const memUsage = calculateMemoryUsage(stats)
                            const memLimit = getMemoryLimit(stats)
                            const memPercent = memLimit > 0 ? (memUsage / memLimit) * 100 : 0

                            logger.debug('Calculated container stats', { 
                                name: container.Names[0], 
                                cpuPercent: cpuPercent.toFixed(1), 
                                memUsage: formatBytes(memUsage),
                                memPercent: memPercent.toFixed(1),
                                memLimit: formatBytes(memLimit),
                                rawMemStats: stats.memory_stats
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

    }
    catch (error) {
        logger.error('loadDockerDataSaga error:', error)
        const timestamp = Date.now()

        // Still provide empty containers array for UI to work
        yield put(fetchContainersSuccess({ containers: [], timestamp }))
        yield put(setConnectionStatus({ isConnected: false }))
    }
    finally {
        yield put(setLoadingStatus(false))
        logger.timeEnd(timerId)
    }
}

// Watcher saga that listens for containers requests
function* watchFetchContainers(): Generator {
    while (true) {
        yield take(ContainerActionTypes.FETCH_CONTAINERS_REQUEST)
        yield fork(loadContainersSaga)  // Use containers-specific saga with stats
    }
}

// Watcher saga that listens for docker info requests  
function* watchFetchDockerInfo(): Generator {
    while (true) {
        yield take(ContainerActionTypes.FETCH_DOCKER_INFO_REQUEST)
        yield fork(loadDockerInfoSaga)  // Use docker-info-specific saga
    }
}

// Legacy watcher for backward compatibility
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
    yield fork(watchFetchContainers)      // For unified loop manager
    yield fork(watchFetchDockerInfo)      // For unified loop manager
    yield fork(watchLoadDockerData)       // Legacy compatibility
    yield fork(autoRefreshSaga)
}
