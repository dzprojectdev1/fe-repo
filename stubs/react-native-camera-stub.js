import React from 'react';
import { View } from 'react-native';
const Camera = (props) => <View style={props.style} />;
Camera.Constants = { Type: {}, FlashMode: {}, CaptureMode: {}, CaptureTarget: {} };
export const RNCamera = Camera;
export default Camera;
