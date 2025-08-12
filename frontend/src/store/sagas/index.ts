import { all, fork } from 'redux-saga/effects'
import containerSaga from './containerSaga'
import networkSaga from './networkSaga'
import systemSaga from './systemSaga'

export default function* rootSaga() {
  yield all([
    fork(containerSaga),
    fork(networkSaga),
    fork(systemSaga),
  ])
}
