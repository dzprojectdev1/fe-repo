import React, {Component} from 'react';
import {ArrowBackIcon, Icon} from 'native-base';
import {
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  TouchableHighlight,
  Text,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import ImageSlider from '../../commonUI/ImageSlider';
// import Slideshow from 'react-native-image-slider-show';
import Video from 'react-native-video';
import video_player from '../../assets/images/video_player.png';
import Global from '../Global';
import { SliderBox } from '../../commonUI/slider/SliderBox';

class ProfileDetail extends Component {
  constructor(props) {
    super(props);
    const {datas, index} = props.route.params;
    console.log(props.route.params);
    this.state = {
      paused: false,
      vUrl: '',
      username: '',
      userage: '',
      userdistance: '',
      otherId: -1,
      datas: datas,
      index: index,
      changedData: [],
      video_indexes: [],
      video_index: -1,
      play_video: false,
    };
  }

  static navigationOptions = {
    header: null,
  };

  componentWillMount() {
    Global.saveData.nowPage = 'ProfileDetail';
    const {url, otherId} = this.props.route.params;
    this.setState({
      vUrl: url,
      otherId: otherId,
    });

    var images = [];
    var custom_datas = this.state.datas;
    
    var {video_indexes} = this.state;

    let swap = custom_datas[this.state.index];
    custom_datas[this.state.index] = custom_datas[0];
    custom_datas[0] = swap;

    for (var i = 0; i < custom_datas.length; i++ ){
      images.push(custom_datas[i].imageUrl);
      if (custom_datas[i].content_type == 2) {
        video_indexes.push(i);
      }
    }

    this.setState(
      {
        changedData: images,
        video_indexes: video_indexes,
      },
      function () {
        console.log('video_indexes', this.state.video_indexes);
      })
  }

  componentDidMount() {
    this.props.navigation.addListener('didFocus', playload => {
      this.setState({paused: false});
    });
  }

  onReject() {
    if (this.state.play_video) {
      this.setState({
        play_video: false,
      });
    } else {
      this.props.navigation.pop();
    }
  }

  playVideo(index) {
    this.setState({
      play_video: true,
      video_index: index,
    });
  }

  
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar
          translucent={true}
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <View>
          {/* {(this.state.vUrl != "") && ( */}
          {this.state.play_video == true && (
            <Video
              source={{uri: this.state.datas[this.state.video_index].videoUrl}} // Can be a URL or a local file.
              ref={ref => {
                this.player = ref;
              }}
              ignoreSilentSwitch={null}
              resizeMode="cover"
              repeat={true}
              paused={this.state.paused}
              onError={this.videoError} // Callback when video cannot be loaded
              style={{height: DEVICE_HEIGHT, width: DEVICE_WIDTH}}
            />
          )}
          {/* <Image
              source={{ uri: this.state.vUrl }}
              style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
            /> */}
            <SliderBox
          ImageComponent={FastImage}
          images={this.state.changedData}
          sliderBoxHeight={DEVICE_HEIGHT}
          onCurrentImagePressed={index => this.onReject()}
          dotColor="#FFEE58"
          inactiveDotColor="#90A4AE"
          paginationBoxVerticalPadding={20}
          paginationBoxStyle={{
            position: 'absolute',
            bottom: 0,
            padding: 0,
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
          }}
          dotStyle={{
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 0,
            padding: 0,
            margin: 0,
            backgroundColor: 'rgba(128, 128, 128, 0.92)',
          }}
          autoplay
          circleLoop
          autoplayInterval={4000}
          ImageComponentStyle={{borderRadius: 15, width: '97%', marginTop: 5}}
          imageLoadingColor="#2196F3"
        />
          {/* <ImageSlider
            loopBothSides
            // autoPlayWithInterval={3000}
            images={this.state.changedData}
            onPress={this.onReject}
            customSlide={({index, item, style, width}) => (
              // It's important to put style here because it's got offset inside
              <View key={index} style={[style, styles.customSlide]}>
                <TouchableOpacity onPress={() => this.onReject()}>
                  <Image source={{uri: item}} style={styles.customImage} />
                  {this.state.video_indexes.indexOf(index) > -1 && (
                    <TouchableOpacity
                      onPress={() => this.playVideo(index)}
                      style={{
                        position: 'absolute',
                        width: 80,
                        height: 80,
                        top: DEVICE_HEIGHT / 2 - 40,
                        left: DEVICE_WIDTH / 2 - 40,
                      }}>
                      <Image
                        source={video_player}
                        style={{width: 80, height: 80}}
                      />
                    </TouchableOpacity>
                  )}
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
                      style={styles.button}>
                      <View
                        style={
                          position === index
                            ? styles.badgeIcon
                            : styles.badgeIconWhite
                        } />
                    </TouchableHighlight>
                  );
                })}
              </View>
            )}
          /> */}
          {/* )} */}
        </View>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 0,
            top: 30,
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => this.onReject()}>
          <ArrowBackIcon size="5" color = '#B64F54'/>
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
  slider: {backgroundColor: '#000', height: 350},
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
  contentText: {color: '#fff'},
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
    margin: 5,
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
  badgeIcon: {
    position: 'absolute',
    zIndex: 1000,
    top: -5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B64F54',
  },
  badgeIconWhite: {
    position: 'absolute',
    zIndex: 1000,
    top: -5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
});
export default ProfileDetail;
