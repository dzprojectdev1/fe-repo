// voice/video call event constants
export const CALL = '@QB/CALL';
export const CALL_END = '@QB/CALL_END';
export const HANG_UP = '@QB/HANG_UP';
export const ACCEPT = '@QB/ACCEPT';
export const NOT_ANSWER = '@QB/NOT_ANSWER';
export const PEER_CONNECTION_STATE_CHANGED =
  '@QB/PEER_CONNECTION_STATE_CHANGED';
export const RECEIVED_VIDEO_TRACK = '@QB/RECEIVED_VIDEO_TRACK';
export const REJECT = '@QB/REJECT';
export const SESSION_TYPE = {
  VIDEO: 1,
  AUDIO: 2,
};

// export const SERVER_URL       = 'http://192.168.0.225:8080';
export const PRODUCTION = true;

export const SERVER_URL = PRODUCTION
  ? 'http://34.172.47.245:8080'
  : 'http://34.66.27.152:8080';
export const SERVER_URL_Production = 'http://34.172.47.245:8080';

export const FIREBASE_DB_UNREAD = PRODUCTION
  ? 'production-dz-chat-unread'
  : 'dz-chat-unread';
export const FIREBASE_DB = PRODUCTION
  ? 'production-dz-chat-data'
  : 'dz-chat-data';

export const GCS_BUCKET = 'https://storage.googleapis.com/dazzled-date-dev/';
export const VIDEO_UPLOAD = 'https://dazzled-date-dev.storage.googleapis.com';
export const BUCKET = 'dazzled-date-dev';
export const GOOGLE_ACCESS_ID = 'dazzled-date-dev@appspot.gserviceaccount.com';

export function capitalizeWords(sentence) {
  return sentence.trim().replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}
