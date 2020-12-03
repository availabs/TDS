import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import { falcorCache, messages } from "@availabs/avl-components"

// import reducers from "components/ams/reducers"

const reducer = combineReducers({
  // ...reducers,
  messages,
  falcorCache
});

export default createStore(reducer, applyMiddleware(thunk))
