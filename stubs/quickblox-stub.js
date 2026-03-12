const QB = {
  init: () => {},
  auth: { connect: () => Promise.resolve(), disconnect: () => Promise.resolve() },
  chat: { connect: () => Promise.resolve(), disconnect: () => Promise.resolve(), sendMessage: () => Promise.resolve() },
  webrtc: { call: () => {}, accept: () => {}, reject: () => {}, hangUp: () => {} },
};
export default QB;
