import { combineReducers } from 'redux';

const INITIAL_STATE = {
    unreadFlag: false
}

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      default:
        return state
    }
  };
  
  export default combineReducers({
    reducer: reducer,
  });