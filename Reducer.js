import { combineReducers } from 'redux';

const INITIAL_STATE = {
  unreadFlag: false,
<<<<<<< HEAD
  senders: [],
  quickBloxInfo: {},
  fcmID: '',
  callEvent: null,
}

const reducer = (state = INITIAL_STATE, action) => {
  let data;
  let newState;
  switch (action.type) {
    case 'CHANGE_READFLAG':
      data = action.payload;
      // Finally, update our redux state
      newState = {
        unreadFlag: data.unreadFlag,
        senders: data.senders,
        quickBloxInfo: state.quickBloxInfo,
        fcmID: state.fcmID,
        callEvent: state.callEvent
      };
      return newState;
    case 'QUICKBLOX_ACTION':
      data = action.payload;
      // Finally, update our redux state
      newState = {
        unreadFlag: state.unreadFlag,
        senders: state.senders,
        quickBloxInfo: data,
        fcmID: state.fcmID,
        callEvent: state.callEvent
      };
      return newState;
    case 'FCMTOKEN_UPDATE':
      data = action.payload;
      newState = {
        unreadFlag: state.unreadFlag,
        senders: state.senders,
        quickBloxInfo: state.quickBloxInfo,
        fcmID: data,
        callEvent: state.callEvent
      };
      return newState;
    case 'CALL_EVENT_CHANGE':
      data = action.payload;
      newState = {
        unreadFlag: state.unreadFlag,
        senders: state.senders,
        quickBloxInfo: state.quickBloxInfo,
        fcmID: state.fcmID,
        callEvent: data
      };
      return newState;
    default:
      return state;
=======
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
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
  }
};

export default combineReducers({
  reducer: reducer,
});