import React, { Component } from "react";
import {
  Icon,
  Content,
} from "native-base";
import { Dimensions, View, StyleSheet, TouchableOpacity, StatusBar, Image, TouchableHighlight, Text } from "react-native";
import ImageSlider from 'react-native-image-slider';
// import Slideshow from 'react-native-image-slider-show';
// import Video from 'react-native-video';
import Global from '../Global';

class ProfileDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: false,
      vUrl: '',
      username: '',
      userage: '',
      userdistance: '',
      otherId: -1,
      datas: props.navigation.state.params.datas,
      index: props.navigation.state.params.index,
      changedData: []
    };
  }

  static navigationOptions = {
    header: null
  };
  
  componentWillMount() {
    Global.saveData.nowPage = 'ProfileDetail';
    this.setState({
      vUrl: this.props.navigation.state.params.url,
      otherId: this.props.navigation.state.params.otherId
    });
    
    var images = [];
    var custom_datas = this.state.datas;

    let swap = custom_datas[this.state.index];
    custom_datas[this.state.index] = custom_datas[0];
    custom_datas[0] = swap;

    for (var i = 0; i < custom_datas.length; i ++ ){
      images.push(custom_datas[i].imageUrl);
    }

    this.setState({
      changedData: images,
    })
    
  }

  componentDidMount() {
    this.props.navigation.addListener('didFocus', (playload) => {
      this.setState({ paused: false })
    });
  }

  onReject() {
    this.props.navigation.pop();
  }
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        <Content>
          {(this.state.vUrl != "") && (
            // <Video source={{ uri: this.state.vUrl }}   // Can be a URL or a local file.
            //   ref={(ref) => {
            //     this.player = ref
            //   }}
            //   ignoreSilentSwitch={null}
            //   resizeMode="cover"
            //   repeat={true}
            //   paused={this.state.paused}
            //   onError={this.videoError}           // Callback when video cannot be loaded
            //   style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }} 
            // />
            // <Image
            //   source={{ uri: this.state.vUrl }}
            //   style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
            // />
            
            <ImageSlider
              loopBothSides
              // autoPlayWithInterval={3000}
              images={this.state.changedData}
              onPress={this.onReject} 
              customSlide={({ index, item, style, width }) => (
                // It's important to put style here because it's got offset inside
                <View key={index} style={[style, styles.customSlide]}>
                  <TouchableOpacity
                    onPress={() => this.onReject()}>
                    <Image source={{ uri: item }} style={styles.customImage} />
                  </TouchableOpacity>
                </View>
              )}
              customButtons={(position, move) => (
                <View style={styles.buttons}>
                  {this.state.changedData.map((image, index) => {
                    return (
                      <TouchableHighlight
                        key={index}
                        underlayColor="#ccc"
                        onPress={() => move(index)}
                        style={styles.button}
                      >
                        <Text style={position === index && styles.buttonSelected}>
                          {index + 1}
                        </Text>
                      </TouchableHighlight>
                    );
                  })}
                </View>
              )}
            />
          )}
        </Content>
        <TouchableOpacity style={{ position: 'absolute', left: 0, top: 30, width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => this.onReject()}>
          <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
        </TouchableOpacity>
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
    flex: 1,
    backgroundColor: '#fff',
  },
  instructions: {
    textAlign: 'center',
    color: '#3333ff',
    marginBottom: 5,
  },
  slider: { backgroundColor: '#000', height: 350 },
  content1: {
    width: '100%',
    height: 50,
    marginBottom: 10,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content2: {
    width: '100%',
    height: 100,
    marginTop: 10,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: { color: '#fff' },
  buttons: {
    zIndex: 1,
    height: 15,
    marginTop: -25,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  button: {
    margin: 3,
    width: 15,
    height: 15,
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSelected: {
    opacity: 1,
    color: 'red',
  },
  customSlide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customImage: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
  },
});
export default ProfileDetail;
