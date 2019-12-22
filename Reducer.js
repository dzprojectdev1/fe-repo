import { combineReducers } from 'redux';

const INITIAL_STATE = {
  userData: null,
  unreadFlag: false,
  senders: [],
  quickBloxInfo: {},
  fcmID: '',
  callEvent: null,
}

const reducer = (state = INITIAL_STATE, action) => {
  let data;
  let newState;
  switch (action.type) {
    case 'CHANGE_USER_DATA':
      data = action.payload;
      newState = {
        userData: data,
        unreadFlag: state.unreadFlag,
        senders: state.senders,
        quickBloxInfo: state.quickBloxInfo,
        fcmID: state.fcmID,
        callEvent: state.callEvent
      }
      return newState;
    case 'CHANGE_READFLAG':
      data = action.payload;
      // Finally, update our redux state
      newState = {
        userData: state.userData,
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
        userData: state.userData,
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
        userData: state.userData,
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
        userData: state.userData,
        unreadFlag: state.unreadFlag,
        senders: state.senders,
        quickBloxInfo: state.quickBloxInfo,
        fcmID: state.fcmID,
        callEvent: data
      };
      return newState;
    default:
      return state;
  }
};

export default combineReducers({
  reducer: reducer,
});