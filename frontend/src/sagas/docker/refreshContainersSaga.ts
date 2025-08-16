import { put } from 'redux-saga/effects'
import { ContainerActionTypes } from '@/store/docker/types'

function* refreshContainersSaga(): Generator {
    console.log('refreshContainersSaga - triggering fresh data load')

    // Trigger fresh data load using the new action
    yield put({ type: ContainerActionTypes.LOAD_DOCKER_DATA_REQUEST })
}

export { refreshContainersSaga }
