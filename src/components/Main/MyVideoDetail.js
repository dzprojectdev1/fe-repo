import React, {Component} from 'react';
import {Text} from 'native-base';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
// import Video from 'react-native-video';
import Global from '../Global';
import * as Sentry from '@sentry/react-native';
import {GCS_BUCKET, SERVER_URL} from '../../config/constants';
import {TopBar} from '../../commonUI/components/topbar';

class MyVideoDetail extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const {vUrl, cdn_id, otherId, id, primary, content_type} =
      this.props.route.params;

    this.state = {
      paused: false,
      username: '',
      userage: '',
      userdistance: '',
      vUrl: vUrl,
      cdn_id: cdn_id,
      otherId: otherId,
      vid: id,
      primary: primary,
      content_type: content_type,
    };
  }

  componentDidMount() {
    Global.saveData.nowPage = 'MyVideoDetail';
    this.setState({username: 'SANDY', userage: 27, userdistance: 302});
    this.props.navigation.addListener('didFocus', playload => {
      this.setState({paused: false});
    });
    // if (this.state.content_type == 2) {
    //   this.getVideoUrl(this.state.cdn_id);
    // }
  }

  getVideoUrl = async cdn_id => {
    var v_url = `${SERVER_URL}/api/storage/videoLink?fileId=` + cdn_id;
    await fetch(v_url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        // console.log('responseJson.url ', responseJson.url);
        this.setState({
          vUrl: responseJson.url,
        });
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        console.log('There is error, please try again!');
      });
  };

  onBack() {
    this.props.navigation.pop();
  }

  onSetPrimary() {
    fetch(`${SERVER_URL}/api/video/setAsPrimary/` + this.state.vid, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          this.setState({primary: 1});
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  }

  render() {
    return (
      <View style={styles.contentContainer}>
        <TopBar onBack={this.onBack.bind(this)} />
        <View>
          {/*{this.state.content_type == 2 && (*/}
          {/*  <Video*/}
          {/*    source={{uri: this.state.vUrl}} // Can be a URL or a local file.*/}
          {/*    ref={ref => {*/}
          {/*      this.player = ref;*/}
          {/*    }}*/}
          {/*    ignoreSilentSwitch={null}*/}
          {/*    resizeMode="cover"*/}
          {/*    repeat={true}*/}
          {/*    style={{height: DEVICE_HEIGHT, width: DEVICE_WIDTH}}*/}
          {/*  />*/}
          {/*)}*/}
          {this.state.content_type == 1 && (
            <Image
              source={{uri: GCS_BUCKET + this.state.cdn_id + '-screenshot'}}
              style={{height: DEVICE_HEIGHT, width: DEVICE_WIDTH}}
            />
          )}
        </View>
        {this.state.primary != 1 && (
          <View style={{position: 'absolute', left: 0, bottom: 70}}>
            <TouchableOpacity
              style={{
                width: DEVICE_WIDTH * 0.4,
                height: 40,
                marginLeft: DEVICE_WIDTH * 0.3,
                marginTop: 20,
                borderRadius: 25,
                backgroundColor: '#DE5859',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => this.onSetPrimary()}>
              <Text style={{color: '#fff', fontSize: 15, fontWeight: 'bold'}}>
                {'Set As Primary'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
export default MyVideoDetail;
