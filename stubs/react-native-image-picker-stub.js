const ImagePicker = {
  showImagePicker: (options, cb) => cb({ didCancel: true }),
  launchCamera: (options, cb) => cb({ didCancel: true }),
  launchImageLibrary: (options, cb) => cb({ didCancel: true }),
};
export default ImagePicker;
