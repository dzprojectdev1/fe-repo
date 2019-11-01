import React, { Component } from "react";
import {
  Footer,
  Button,
  FooterTab,
  Icon,
  Text
} from "native-base";
import {
  ActivityIndicator,
  ImageBackground,
  BackHandler,
  Image,
  ScrollView,
  Platform,
  Dimensions,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert
} from "react-native";
import { connect } from 'react-redux';
import { Badge } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker';
// import OnlyGImage from '../../assets/images/OnlyGImage.png';
import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';
import b_delete from '../../assets/images/delete.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import Global from '../Global';

import { SERVER_URL, GCS_BUCKET } from '../../config/constants';
import { uploadPhoto } from '../../util/upload';

class MyVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      isLoading: true,
      noData: false,
      coinCount: Global.saveData.coin_count,
      visible: false,
    };
  }

  static navigationOptions = {
    header: null
  };
  componentDidMount() {
    Global.saveData.nowPage = 'MyVideo';
    this.props.navigation.addListener('didFocus', (playload) => {
      this.getVideos()
    });
  }
  getVideos() {
    fetch(`${SERVER_URL}/api/video/getMyAllVideo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          if (responseJson.data.length) {
            // this.getThumbnails(responseJson.data);
            this.setState({ datas: responseJson.data, isLoading: false, noData: false });
          } else {
            this.setState({
              noData: true,
              isLoading: false, 
              datas: [],
            });
          }
        }
      })
      .catch((error) => {
        console.log('getVideos() Error', error);
      });
  }
  getThumbnails(videos) {
    const list_items = [];
    Promise.all(
      videos.map((video, idx) => {
        return fetch(
          `${SERVER_URL}/api/storage/videoLink?fileId=${video.cdn_id}-screenshot`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': Global.saveData.token
            }
          }
        )
          .then(response => {
            return response.json()
              .catch(e => {
                console.log(`.json() error:`, e);
                return null;
              });
          })
          .then(signedUrl => {
            if (signedUrl && signedUrl.url) {
              return {
                index: idx,
                id: video.id,
                otherId: video.user_id,
                primary: video.is_primary,
                imageUrl: signedUrl.url,
                videoUrl: `${SERVER_URL}/api/storage/videoLink?fileId=${video.cdn_id}`,
                name: 'NAME',
                time: 'TIME'
              }
            } else {
              return null;
            }
          });
      })
    )
      .then(assets => assets.filter(Boolean))
      .then(assets => {
        this.setState({ datas: assets, isLoading: false, noData: false });
      });
  }
  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }
  backPressed = () => {
    this.props.navigation.replace("Chat");
    return true;
  }
  showUserVideo(url, user_id, id, primary) {
    // fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': Global.saveData.token
    //   }
    // }).then((response) => response.json())
    //   .then((responseJson) => {
    //     this.props.navigation.navigate("MyVideoDetail", { url: url, otherId: otherId, id: id, primary })
    //   }).catch((error) => {
    //     alert("There is error, please try again!");
    //     return
    //   });
    this.props.navigation.navigate("MyVideoDetail", { url: url, otherId: user_id, id: id, primary })
  }
  addVideo() {
    // this.props.navigation.navigate("Record")

    // More info on all the options is below in the API Reference... just some common use cases shown here
    const options = {
      title: 'Select Picture',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (imagePickerResponse) => {
      // console.log('Response = ', response);
      if (imagePickerResponse.didCancel) {
        console.log('User cancelled image picker');
      } else if (imagePickerResponse.error) {
        console.log('ImagePicker Error: ', imagePickerResponse.error);
      } else if (imagePickerResponse.customButton) {
        console.log('User tapped custom button: ', imagePickerResponse.customButton);
      } else {
        uploadPhoto(imagePickerResponse)
          .then(() => {
            this.getVideos();
          });
      }
    });
  }
  onDeleteVideo(otherid) {
    Alert.alert(
      '',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Delete', backgroundColor: '#FCDD80', onPress: () => this.deleteVideo(otherid) },
        { text: 'Cancel', backgroundColor: '#FCDD80', onPress: () => () => console.log('Cancel Pressed'), style: 'cancel' },
      ],
      { cancelable: false });
  }
  deleteVideo(otherid) {
    fetch(`${SERVER_URL}/api/video/removeMyVideo/${otherid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          this.getVideos()
        }
      })
      .catch((error) => {
        return
      });
  }
  gotoProfileSetting() {
    this.props.navigation.navigate("ProfileSetting");
  }
  //////////////////////////////////////////////////
  gotoGpay() {
    this.props.navigation.navigate("screenGpay01");
  }
  //////////////////////////////////////////////////
  gotoShop = () => {
    this.setState({
      visible: false
    })
    this.props.navigation.navigate('screenGpay01');
  }

  gotoMainMenu = (menu) => {
      this.updateLastLoggedInDate();
      this.props.navigation.replace(menu);
  }

  updateLastLoggedInDate = () => {
      fetch(`${SERVER_URL}/api/match/updateLastLoggedInDate`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': Global.saveData.token
          },
      }).then((response) => response.json())
          .then((responseJson) => {
              if (!responseJson.error) {
                  return
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
        <View style={{ marginTop: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ width: 60, height: 40 }}
            onPress={() => this.gotoShop()}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={diamond} style={{ width: 25, height: 25, marginLeft: 15, marginTop: 10 }} />
              <Text style={{ marginLeft: 10, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
            </View>
          </TouchableOpacity>
          <Text style={{ justifyContent: 'center', marginLeft: -15 }}>{"PROFILE"}</Text>
          <TouchableOpacity style={{ width: 30, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}
            onPress={() => this.gotoProfileSetting()}>
            <Icon type="MaterialCommunityIcons" name="menu" style={{ color: "#000", marginTop: 5 }} />
          </TouchableOpacity>
        </View>
        {this.state.isLoading && (
          <View style={{
            flex: 1, justifyContent: 'center', alignSelf: 'center', margin: 40
          }}>
            <ActivityIndicator style={{ color: '#DE5859' }} />
          </View>
        )}
        {this.state.noData && !this.state.isLoading && (
          <View style={{
            flex: 1, justifyContent: 'center', alignSelf: 'center', margin: 35
          }}>
            <Text style={{
              color: '#000',
              fontSize: 20,
              textAlign: "center",
              alignContent: 'center'
            }}>You dont have any photo. {'\n'} Please upload more than one so that others can find you more easily.</Text>
          </View>
        )}

        <ScrollView style={{ marginTop: 15 }} removeClippedSubviews={true}>
          {(this.state.datas.length !== 0) && (
            <FlatList
              numColumns={2}
              style={{ flex: 0 }}
              removeClippedSubviews={true}
              data={this.state.datas}
              initialNumToRender={this.state.datas.length}
              renderItem={({ item: rowData }) => {
                return (
                  <TouchableOpacity style={{ width: DEVICE_WIDTH / 2 - 10, marginTop: 10, marginLeft: 5, marginRight: 5, }}
                    onPress={() => this.showUserVideo(GCS_BUCKET + rowData.cdn_id + '-screenshot', rowData.user_id, rowData.id, rowData.primary)}>
                    {/* <ImageBackground source={{ uri: rowData.imageUrl }} resizeMethod="resize" style={{ width: DEVICE_WIDTH / 2 - 20, height: (DEVICE_WIDTH / 2 - 20) * 1.5, marginTop: 3, marginLeft: 5, backgroundColor: '#5A5A5A' }}> */}
                    <ImageBackground source={{ uri: GCS_BUCKET +  rowData.cdn_id + '-screenshot'}} resizeMethod="resize" style={{ width: DEVICE_WIDTH / 2 - 20, height: (DEVICE_WIDTH / 2 - 20) * 1.5, marginTop: 3, marginLeft: 5, backgroundColor: '#5A5A5A' }}>
                      <View style={{ width: '100%', height: 30, marginTop: (DEVICE_WIDTH / 2 - 20) * 1.5 - 50, flexDirection: 'row' }}>
                        <View style={{ width: DEVICE_WIDTH / 2 - 60, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                          {(rowData.is_primary == 1) && (
                            <View style={{ width: DEVICE_WIDTH, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 40 }}>
                              <TouchableOpacity style={{ width: 80, height: 30, borderRadius: 25, backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 14, color: '#fff', fontWeight: 'bold' }}>{"Primary"}</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => this.onDeleteVideo(rowData.id)}>
                          <Image source={b_delete} style={{ width: 30, height: 30 }} />
                        </TouchableOpacity>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />)}
          <View style={{ height: 50 }} />
        </ScrollView>
        <TouchableOpacity style={{
          position: 'absolute', right: 15,
          bottom: Platform.select({ 'android': 90, 'ios': 105 }),
          width: 70, height: 70,
          backgroundColor: '#f00', borderRadius: 35,
          alignItems: 'center', justifyContent: 'center'
        }}
          onPress={() => this.addVideo()}>
          <Icon type="FontAwesome" name="plus" style={{ color: '#fff' }} />
        </TouchableOpacity>
        <Footer style={{ height: Platform.select({ 'android': 50, 'ios': 50 }) }}>
          <FooterTab>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("BrowseList")}>
              <Image source={b_browse} style={{ width: 25, height: 25, }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"BROWSE"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Income")}>
              <Image source={b_incoming} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"INCOMING"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Match")}>
              <Image source={b_match} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"MATCH"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Chat")}>
              {this.props.unreadFlag && (<View style={styles.badgeIcon}><Text style={{ color: '#FFF', textAlign: 'center', fontSize: 10, }}>{'N'}</Text></View>)}
              <Image source={b_chat} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"CHAT"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => { }}>
              <Image source={b_myvideo} style={{ width: 25, height: 25, tintColor: '#B64F54' }} />
              <Text style={{ color: '#B64F54', fontSize: 8, fontWeight: 'bold', marginTop: 3 }}>{"PROFILE"}</Text>
            </Button>
            {/* <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoGpay()}>
              <Image source={OnlyGImage} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"GPAY"}</Text>
            </Button> */}
          </FooterTab>
        </Footer>
      </View>
    );
  }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
// const DEVICE_HEIGHT = Dimensions.get('window').height;
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
  badgeIcon: {
    position: 'absolute',
    zIndex: 1000,
    top: -5,
    right: 15,
    width: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B64F54'
  }
});

const mapStateToProps = (state) => {
  const { unreadFlag } = state.reducer
  return { unreadFlag }
};

export default connect(mapStateToProps)(MyVideo);