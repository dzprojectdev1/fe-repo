import React, { Component } from "react";
import {
  Icon,
  Text,
  Content,
} from "native-base";
import { Dimensions, View, StyleSheet, TouchableOpacity, StatusBar, Image } from "react-native";
import Video from 'react-native-video';
import Global from '../Global';

import { SERVER_URL, GCS_BUCKET } from '../../config/constants';

class MyVideoDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: false,
      username: '',
      userage: '',
      userdistance: '',
      vUrl: this.props.navigation.state.params.vUrl,      
      cdn_id: this.props.navigation.state.params.cdn_id,
      otherId: this.props.navigation.state.params.otherId,
      vid: this.props.navigation.state.params.id,
      primary: this.props.navigation.state.params.primary,
      content_type: this.props.navigation.state.params.content_type,
    };
  }

  static navigationOptions = {
    header: null
  };
  componentDidMount() {
    Global.saveData.nowPage = 'MyVideoDetail';
    this.setState({ username: 'SANDY', userage: 27, userdistance: 302 })
    this.props.navigation.addListener('didFocus', (playload) => {
      this.setState({ paused: false })
    });
    // if (this.state.content_type == 2) {
    //   this.getVideoUrl(this.state.cdn_id);
    // }
  }
  componentWillMount() {
  }


  getVideoUrl = async (cdn_id) => {
    var v_url = `${SERVER_URL}/api/storage/videoLink?fileId=` + cdn_id;
    await fetch(v_url, {
        method: 'GET',
        headers: { 
            'Content-Type':'application/json',
            'Authorization':Global.saveData.token
        }
    }).then((response) => response.json())
        .then((responseJson) => {
          console.log('responseJson.url ', responseJson.url);
            this.setState({
              vUrl: responseJson.url,
            })
        })
        .catch((error) => {
            console.log("There is error, please try again!");
            return
    });
  }



  onBack() {
    this.props.navigation.pop()
  }
  onSetPrimary() {
    fetch(`${SERVER_URL}/api/video/setAsPrimary/` + this.state.vid, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          this.setState({ primary: 1 })
        }
      })
      .catch((error) => {
        return
      });
  }
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        <Content>
          {this.state.content_type == 2 && (<Video source={{ uri: this.state.vUrl }}   // Can be a URL or a local file.
            ref={(ref) => {
              this.player = ref
            }}
            ignoreSilentSwitch={null}
            resizeMode="cover"
            repeat={true}
            style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }} 
          />)}
          {this.state.content_type == 1 && (<Image
            source={{ uri: GCS_BUCKET + this.state.cdn_id + '-screenshot' }}
            style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
          />)}
        </Content>
        <TouchableOpacity style={{ position: 'absolute', left: 0, top: 30, width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => this.onBack()}>
          <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
        </TouchableOpacity>
        {(this.state.primary != 1) && (
          <View style={{ position: 'absolute', left: 0, bottom: 70, }}>
            <TouchableOpacity style={{ width: DEVICE_WIDTH * 0.4, height: 40, marginLeft: DEVICE_WIDTH * 0.3, marginTop: 20, borderRadius: 25, backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => this.onSetPrimary()}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>{"Set As Primary"}</Text>
            </TouchableOpacity>
          </View>)}
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
