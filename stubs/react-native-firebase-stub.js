const firebase = {
  messaging: () => ({
    getToken: () => Promise.resolve('stub-token'),
    requestPermission: () => Promise.resolve(),
    onMessage: () => () => {},
    onTokenRefresh: () => () => {},
  }),
  notifications: () => ({
    onNotification: () => () => {},
    onNotificationOpened: () => () => {},
    getInitialNotification: () => Promise.resolve(null),
  }),
  analytics: () => ({
    logEvent: () => {},
    setUserId: () => {},
  }),
};
export default firebase;
