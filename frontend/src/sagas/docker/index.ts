import { fork, takeEvery } from 'redux-saga/effects'

import { ContainerActionTypes } from '@/store/docker/types'
import loadDockerSaga from './loadDockerSaga'
import autoRefreshSaga from './autoRefreshSaga'
import { executeContainerActionSaga } from './executeContainerActionSaga'
import { restartNginxSaga } from './restartNginxSaga'
import { refreshContainersSaga } from './refreshContainersSaga'

// Root Container Saga
export default function* containerSaga(): Generator {
    console.log('containerSaga started')

    // Fork the main sagas - they will run concurrently
    yield fork(loadDockerSaga)
    yield fork(autoRefreshSaga)

    // Take actions for container operations
    yield takeEvery(ContainerActionTypes.EXECUTE_CONTAINER_ACTION_REQUEST, executeContainerActionSaga)
    yield takeEvery(ContainerActionTypes.RESTART_NGINX, restartNginxSaga)
    yield takeEvery(ContainerActionTypes.REFRESH_CONTAINERS, refreshContainersSaga)
}
