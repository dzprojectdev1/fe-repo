import React, { Component } from "react";
import {
  Text,
  Icon,
} from "native-base"
import { Image, Dimensions, View, StyleSheet, TouchableOpacity, StatusBar, Alert } from "react-native";
import { RNCamera } from 'react-native-camera';
import Video from 'react-native-video';
import heart from '../../assets/images/heart.png';
import playing from '../../assets/images/playing.png';
import recordImg from '../../assets/images/b_recording.png';
import saving from '../../assets/images/saving.png';
import retrying from '../../assets/images/retrying.png';
import stoping from '../../assets/images/stoping.png';
import b_stop from '../../assets/images/b_stop.png';
import switching_camera from '../../assets/images/switching_camera.png';
import Global from '../Global';

import {SERVER_URL, GCS_BUCKET, VIDEO_UPLOAD, BUCKET, GOOGLE_ACCESS_ID} from '../../config/constants';
import { uploadVideo } from '../../util/uploadVideo';
import { TextInput } from "react-native-gesture-handler";
import FlashMessage, { showMessage } from 'react-native-flash-message';

class Record extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      isRecorded: false,
      recordedUri: '',
      paused: true,
      saving: false,
      recordTime: 0,
      recordTimeText: '00:00',
      uploadCredentials: null,
      fileId: '',
      camera: 'front',
      camera_type: RNCamera.Constants.Type.front,
    };
  }
  static navigationOptions = {
    header: null
  };
  componentDidMount() {
    Global.saveData.nowPage = 'Record';
    Global.saveData.prevpage = 'Record';
    fetch(`${SERVER_URL}/api/storage/uploadCredentials?contentType=2`, {
      method: 'GET',
      headers: {        
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      },
    })
    .then(response => {
      return response.json();
    })
    .then(uploadCredentials => {
      if (uploadCredentials.message === 'Auth Failed') {
        throw new Error(uploadCredentials.message);
      } else {
        this.setState({
          uploadCredentials,
        });
      }
    })
    .catch((error) => {
      console.log(`error`, error);
    });
  }
  onRecord() {
    if (this.state.recording) {
      this.stopRecording()
    }
    else {
      this.setState({ isRecorded: false, recording: true, recordedUri: '', recordTimeText: '00:00' });
      this.startRecording()
    }
  }
  onRetry() {
    this.setState({
      recording: false,
      isRecorded: false,
      recordedUri: '',
      paused: true,
      saving: false,
      recordTime: 0,
      recordTimeText: '',
    })
  }
  async startRecording() {
    // default to mp4 for android as codec is not set
    let timer = setInterval(this.setTime, 1000);
    this.setState({ timer });
    const { uri, codec = "mp4" } = await this.camera.recordAsync();
    this.setState({ isRecorded: true, recording: false, recordedUri: uri, });
  }
  setTime = () => {
    var rtime = this.state.recordTime + 1;
    var min = parseInt(rtime / 60);
    var sec = rtime - 60 * min;
    var rtext = ""
    if (min < 10) {
      rtext = "0" + min + ":"
    }
    else {
      rtext = "" + min + ":"
    }
    if (sec < 10) {
      rtext = "" + rtext + "0" + sec
    }
    else {
      rtext = "" + rtext + sec
    }
    this.setState({ recordTime: rtime, recordTimeText: rtext })
  }
  stopRecording() {
    clearTimeout(this.state.timer);
    this.setState({ recordTime: 0, recordTimeText: '00:00' });
    this.camera.stopRecording();
    // this.setState({isRecorded:true,recording:false,});
  }
  videoError() {

  }
  openPlay() {
    this.setState({ paused: false })
  }
  openStop() {
    this.setState({ paused: true })
  }
  onUpload() { 
    // this.showVideoUploadedMessage(); 
    console.log('recordedUri', this.state.recordedUri);
    console.log('uploadCredentials', this.state.uploadCredentials);
    const {
      policy,
      fileId,
    } = this.state.uploadCredentials;
    const file = this.state.recordedUri;
    this.setState({
      fileId: fileId
    });

    console.log('policy', policy);
    console.log('fileId', fileId);

    const formData = new FormData();
    formData.append('GoogleAccessId', GOOGLE_ACCESS_ID);
    formData.append('key', fileId);
    formData.append('bucket', BUCKET);
    formData.append('Content-Type', 'video/mp4');
    formData.append('policy', policy.base64);
    formData.append('signature', policy.signature);
    formData.append("file", {
      name: "video.mp4",
      type: 'video/mp4',
      uri: this.state.recordedUri,
    });

    console.log('formData', formData);

    fetch(VIDEO_UPLOAD, {
      method: 'POST',
      // mode: 'no-cors',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => {
      console.log('success', res);

      if (res.ok) {
        this.registerVideo();
      }
    }).catch(err => {
      console.log('error', err);
      return;
    });
    
    Alert.alert(
      '',
      "Video uploading is in progress. It usually take 2 to 10 minutes to upload video depends on the size of the video",
      [
        {text: 'OK', onPress: () => this.props.navigation.replace('MyVideo')},
      ],
      {cancelable: false},
    );
  }
  /**
   * 
   * @param {file data} fileData 
   * inserting video data to tbl_video
   */
  registerVideo() {  
    var details = {
      'cdn_id': this.state.fileId,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/upload/insertVideo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          console.log('Response ', responseJson);
          // this.props.navigation.replace('MyVideo');
        }
      })
      .catch((error) => {
        console.log('Error ', error);
        return
      });
  }
  onBack() {
    this.props.navigation.pop()
  }
  switchCamera() {
    if (this.state.camera == 'front') {
      this.setState({
        camera: 'back',
        camera_type: RNCamera.Constants.Type.back,
      })
    } else {
      this.setState({
        camera: 'front',
        camera_type: RNCamera.Constants.Type.front,
      })
    }
  }

  showVideoUploadedMessage = () => {
    this.refs.fmLocalInstance.showMessage({
      message: "Video is uploading. It will show up in your profile page in 1-10 minutes (depends on the size of the video).",
      type: "info",
    });
  }
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        {!this.state.isRecorded && <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
          type={this.state.camera_type}
          flashMode={RNCamera.Constants.FlashMode.on}
          permissionDialogTitle={"Permission to access camera"}
          permissionDialogMessage={
            "In order for you to record a video, permission must be granted to access your device's camera."
          }
        />}

        {this.state.isRecorded &&
          <Video source={{ uri: this.state.recordedUri }}   // Can be a URL or a local file.
            ref={(ref) => {
              this.player = ref
            }}
            paused={this.state.paused}
            repeat={true}
            onEnd={() => this.openStop()}
            onError={this.videoError}               // Callback when video cannot be loaded
            style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }} />
        }
        <TouchableOpacity style={{ position: 'absolute', left: 0, top: 30, width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => this.onBack()}
        >
          <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
        </TouchableOpacity>
        {/* {!this.state.isRecorded && (
          <View style={{ position: 'absolute', top: DEVICE_HEIGHT * 0.2, width: DEVICE_WIDTH, height: DEVICE_WIDTH * 0.7, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={heart} style={{ width: DEVICE_WIDTH * 0.7, height: DEVICE_WIDTH * 0.7, opacity: 0.75 }} />
          </View>)} */}
        {this.state.recording && (
          <View style={{
            position: 'absolute', left: 0, bottom: 100, height: 40, width: DEVICE_WIDTH,
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Text style={{ fontSize: 18, color: '#DE5859' }}>{this.state.recordTimeText}</Text>
          </View>)}
        <View
          style={{
            position: 'absolute', left: 0, bottom: 30, height: 40, width: DEVICE_WIDTH, flexDirection: 'row',
            alignItems: 'center', justifyContent: 'center'
          }}>
          <View style={{ width: DEVICE_WIDTH * 0.8, height: 60, flexDirection: 'row', justifyContent: this.state.isRecorded ? 'space-between' : 'center' }}>
          {/* <View style={{ width: DEVICE_WIDTH * 0.8, height: 60, flexDirection: 'row', justifyContent: 'space-between'}}> */}
            {this.state.isRecorded && this.state.paused && (
              <TouchableOpacity onPress={() => this.openPlay()}>
                <Image source={playing} style={{ width: 60, height: 60 }} />
              </TouchableOpacity>)}
            {this.state.isRecorded && !this.state.paused && (
              <TouchableOpacity onPress={() => this.openStop()}>
                <Image source={stoping} style={{ width: 60, height: 60 }} />
              </TouchableOpacity>)}
            {!this.state.isRecorded && (
              <TouchableOpacity
                // onPress={() => this.onRecord()}
              //  activeOpacity={1.0} 
              //  delayPressIn={0}
              //  onPressIn={()=>this.onRecord()}
              //  onPressOut={()=>this.onRecord()}
              >
                {/* <Image source={recordImg} style={{ width: 60, height: 60, display: 'none' }} /> */}
                <Text style={{width: 60, height: 60,}}>{null}</Text>
              </TouchableOpacity>)}
            {!this.state.isRecorded && (
              <TouchableOpacity
                onPress={() => this.onRecord()}
              //  activeOpacity={1.0} 
              //  delayPressIn={0}
              //  onPressIn={()=>this.onRecord()}
              //  onPressOut={()=>this.onRecord()}
              >
                <Image source={this.state.recording? b_stop : recordImg} style={{ width: 60, height: 60, marginLeft: 27,}} />
              </TouchableOpacity>)}
            {!this.state.isRecorded && !this.state.recording && (
              <TouchableOpacity
                onPress={() => this.switchCamera()}
              //  activeOpacity={1.0} 
              //  delayPressIn={0}
              //  onPressIn={()=>this.onRecord()}
              //  onPressOut={()=>this.onRecord()}
              >
                <Image source={switching_camera} style={{ width: 85, height: 85, marginTop: -12, }} />
              </TouchableOpacity>)}              
            {!this.state.isRecorded && this.state.recording && (
              <TouchableOpacity
                // onPress={() => this.onRecord()}
              //  activeOpacity={1.0} 
              //  delayPressIn={0}
              //  onPressIn={()=>this.onRecord()}
              //  onPressOut={()=>this.onRecord()}
              >
                {/* <Image source={recordImg} style={{ width: 60, height: 60, display: 'none' }} /> */}
                <Text style={{width: 85, height: 85,}}>{null}</Text>
              </TouchableOpacity>)}
            {this.state.isRecorded && (
              <TouchableOpacity onPress={() => this.onRetry()}>
                <Image source={retrying} style={{ width: 60, height: 60 }} />
              </TouchableOpacity>)}
            {this.state.isRecorded && (
              <TouchableOpacity onPress={() => this.onUpload()}>
                <Image source={saving} style={{ width: 60, height: 60 }} />
              </TouchableOpacity>)}
          </View>
        </View>
        <FlashMessage ref="fmLocalInstance" position="top" animated={true} autoHide={true} />
      </View>
    );
  }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  instructions: {
    textAlign: 'center',
    color: '#3333ff',
    marginBottom: 5,
  },
});
export default Record;
