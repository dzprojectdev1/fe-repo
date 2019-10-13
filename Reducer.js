import { combineReducers } from 'redux';

const INITIAL_STATE = {
  unreadFlag: false,
  senders: []
}

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CHANGE_READFLAG':
      const data = action.payload;
      // Finally, update our redux state
      const newState = { unreadFlag : data.unreadFlag, senders: data.senders };
      return newState;
    default:
      return state
  }
};

export default combineReducers({
  reducer: reducer,
});