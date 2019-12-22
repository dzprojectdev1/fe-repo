
export const updateUserData = payload => (
    {
        type: 'CHANGE_USER_DATA',
        payload: payload
    }
);

export const changeReadFlag = payload => (
    {
        type: 'CHANGE_READFLAG',
        payload: payload,
    }
);

export const updateQuickBlox = payload => (
    {
        type: 'QUICKBLOX_ACTION',
        payload: payload,
    }
);

export const updateFCMTocken = payload => (
    {
        type: 'FCMTOKEN_UPDATE',
        payload: payload
    }
);

export const updateCallEvent = payload => (
    {
        type: 'CALL_EVENT_CHANGE',
        payload: payload
    }
);
