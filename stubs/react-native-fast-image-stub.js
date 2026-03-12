import React from 'react';
import { Image } from 'react-native';
const FastImage = (props) => <Image {...props} />;
FastImage.resizeMode = { contain: 'contain', cover: 'cover', stretch: 'stretch', center: 'center' };
FastImage.priority = { low: 'low', normal: 'normal', high: 'high' };
export default FastImage;
