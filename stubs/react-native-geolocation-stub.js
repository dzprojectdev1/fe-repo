const Geolocation = {
  getCurrentPosition: (success) => success({ coords: { latitude: 0, longitude: 0 } }),
  watchPosition: () => 0,
  clearWatch: () => {},
  stopObserving: () => {},
};
export default Geolocation;
