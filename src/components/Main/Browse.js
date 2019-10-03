import React, { Component } from "react";
import {
  Icon,
  Text,
  Content,
} from "native-base";
import {
  AsyncStorage,
  BackHandler,
  ActivityIndicator,
  Image,
  ScrollView,
  // Platform,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  // Alert
} from "react-native";
import { Button } from 'react-native-elements';
// import Video from 'react-native-video';
// import b_browse from '../../assets/images/browse.png';
// import b_incoming from '../../assets/images/incoming.png';
// import b_match from '../../assets/images/match.png';
// import b_chat from '../../assets/images/chat.png';
// import b_myvideo from '../../assets/images/myvideo.png';
// import OnlyGImage from '../../assets/images/OnlyGImage.png';
import b_notification from '../../assets/images/notification.png';
import b_filters from '../../assets/images/filters.png';
import b_name from '../../assets/images/name.png';
import b_age from '../../assets/images/age.png';
import b_distance from '../../assets/images/distance.png';
import b_profile from '../../assets/images/profile.png';
// import no_image from '../../assets/images/no-image.png';
import no_photo from '../../assets/images/no_photo.png';
import Global from '../Global';

import { SERVER_URL } from '../../config/constants';

class Browse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otherData: props.navigation.state.params.data,
      heartIcon: 'heart',
      hateIcon: 'close',
      isLoading: false,
      disabled: false,
      noMoreUsers: false,
      // operatedIDArr: [],
    };
  }

  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    Global.saveData.nowPage = 'Browse';
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }

  // componentDidMount() {
  //   this.props.navigation.addListener('didFocus', (playload) => {
  //     if (Global.saveData.isFilter) {
  //       this.getFilterVideos();
  //     }
  //     else {
  //       this.getVideos();
  //     }
  //   });
  // }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }

  getVideos() {
    fetch(`${SERVER_URL}/api/match/discover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          if (responseJson.data) {
            this.setState({
              noMoreUsers: false
            });
            this.getDetails(responseJson.data);
          } else {
            this.setState({
              noMoreUsers: true
            })
          }
        }
      })
      .catch((error) => {
        return
      });
  }
  getFilterVideos() {
    AsyncStorage.getItem('filterData', (err, result) => {
      var details = {};
      if (result !== null) {
        alert(result);
        let filterStore = JSON.parse(result);
        details = {
          gender: filterStore.gender,
          lessAge: filterStore.toAge,
          greaterAge: filterStore.fromAge,
          distance: filterStore.distance
        };
        if (filterStore.city_index) {
          details.ethnicityId = filterStore.city_index;
        }
        if (filterStore.language_index) {
          details.languageId = filterStore.language_index;
        }
        if (filterStore.country_index) {
          details.countryId = filterStore.country_index;
        }
      };
      var formBody = [];
      for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");
      fetch(`${SERVER_URL}/api/match/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': Global.saveData.token
        },
        body: formBody,
      }).then((response) => response.json())
        .then((responseJson) => {
          if (!responseJson.error) {
            if (responseJson.data) {
              this.setState({
                noMoreUsers: false
              });
              this.getDetails(responseJson.data);
            } else {
              this.setState({
                noMoreUsers: true
              })
            }
          }
        }).catch((error) => {
          return
        }
        );
    });
  }
  getDetails = async (data) => {
    if (data.cdn_filtered_id) {
      var v_url = `${SERVER_URL}/api/storage/videoLink?fileId=${data.cdn_filtered_id}-screenshot`;
      fetch(v_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Global.saveData.token
        }
      }).then((response) => response.json())
        .then((responseJson) => {
          var otherData = {};
          if (responseJson.url) {
            otherData = {
              imageUrl: responseJson.url,
              detail: data
            };
          } else {
            otherData = {
              imageUrl: null,
              detail: data
            };           
          }
          this.setState({
            otherData
          });
        })
        .catch((error) => {
          alert(JSON.stringify(error));
          return
        }
        );
    } else {
      var otherData = {
        imageUrl: null,
        detail: data
      };
      this.setState({
        otherData
      })
    }
  }
  onReject() {
    this.setState({
      isLoading: true,
      disabled: false
    });
    var details = {
      'otherId': this.state.otherData.detail.id
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/match/dislike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {       
        if (!responseJson.error) {
          // let operateArr = this.state.operatedIDArr;
          // let newIdArr = [];
          // newIdArr.push(this.state.otherData.detail.id);
          // operateArr = operateArr.concat(newIdArr);
          // this.setState({
          //   operatedIDArr: operateArr
          // });
          this.getFilterVideos();
        }
        this.setState({
          isLoading: false,
          disabled: false
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          disabled: false
        });
        return
      });
  }
  onHeart() {
    this.setState({
      isLoading: true,
      disabled: true
    });
    var details = {
      'otherId': this.state.otherData.detail.id
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/match/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {       
        // alert(JSON.stringify(responseJson));
        if (!responseJson.error) {
          // let operateArr = this.state.operatedIDArr;
          // let newIdArr = [];
          // newIdArr.push(this.state.otherData.detail.id);
          // operateArr = operateArr.concat(newIdArr);
          // this.setState({
          //     operatedIDArr: operateArr
          // });
          this.getFilterVideos();
        }
        this.setState({
          isLoading: false,
          disabled: false
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          disabled: false
        });
        return
      });
  }

  backPressed = () => {
    // this.props.navigation.navigate("BrowseList", {ids: this.state.operatedIDArr});
    this.props.navigation.replace("BrowseList");
    return true;
  }
  gotoFilter() {
    this.props.navigation.navigate("Filter");
  }
  // gotoIncome() {
  //   this.props.navigation.replace("Income");
  // }
  // gotoMatch() {
  //   this.props.navigation.replace("Match");
  // }
  // gotoChat() {
  //   this.props.navigation.replace("Chat");
  // }
  // gotoMyVideo() {
  //   this.props.navigation.replace("MyVideo");
  // }
  gotoProfile = () => {
    Global.saveData.prevpage = "Browse";
    this.props.navigation.replace("Profile",
      { id: this.state.otherData.detail.id, name: this.state.otherData.detail.name }
    );
  }
  gotoReport() {
    this.props.navigation.navigate("Report", { otherId: this.state.otherData.detail.id })
  }
  //////////////////////////////////////////////////
  // gotoGpay(){
  //   this.props.navigation.navigate("screenGpay01");
  // }
  //////////////////////////////////////////////////
  // videoError = () => {
  //   alert('Video Loading Error!');
  // }
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        {this.state.noMoreUsers ?
          (<Content>
            <View>
              <View style={{ alignSelf: 'flex-end', marginTop: '10%', marginRight: '5%', position: 'absolute', }}>
                <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => this.gotoFilter()}>
                  <Image source={b_filters} style={{ width: 25, height: 25 }} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: '50%', paddingBottom: '50%' }}>
                <Text style={{ fontSize: 20, }}>{"Sorry, there are no more users!"}</Text>
              </View>
            </View>
          </Content>) : (
            <Content>
              {/* {(this.state.vUrl != "") && (
                <Video source={{ uri: this.state.vUrl }}   // Can be a URL or a local file.
                  ref={(ref) => {
                    this.player = ref
                  }}
                  resizeMode="cover"
                  ignoreSilentSwitch={null}
                  repeat={true}
                  paused={false}
                  onError={this.videoError}               // Callback when video cannot be loaded
                  style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
                />
              )} */}
              {this.state.otherData.imageUrl ? (
                <Image
                  source={{ uri: this.state.otherData.imageUrl }}
                  style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
                />
              ) : (
                  <View style={{
                    flex: 1,
                    backgroundColor: '#989392',
                    height: DEVICE_HEIGHT,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Image
                      source={no_photo}
                      style={{ justifyContent: 'center', alignSelf: 'center' }}
                    />
                  </View>
                )}
              <View style={{ position: 'absolute', left: 0, top: 30 }}>
                <TouchableOpacity style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}
                  onPress={this.backPressed}>
                  <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
                </TouchableOpacity>
              </View>
              <View style={{ position: 'absolute', left: 20, top: 40, }}>
                <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.gotoReport()}>
                    <Image source={b_notification} style={{ width: 25, height: 25 }} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.gotoFilter()}>
                    <Image source={b_filters} style={{ width: 25, height: 25 }} />
                  </TouchableOpacity>
                </View>
                <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View></View>
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={this.gotoProfile}>
                    <Image source={b_profile} style={{ width: 25, height: 25 }} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ position: 'absolute', left: 0, bottom: 40 }}>
                <View style={{marginLeft: DEVICE_WIDTH * 0.1, marginBottom: 20}}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={b_name} style={{ width: 15, height: 15 }} />
                    <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Image source={b_age} style={{ width: 15, height: 15 }} />
                    <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.age + ' years old'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Image source={b_distance} style={{ width: 15, height: 15 }} />
                    <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{parseInt(this.state.otherData.detail.distance) + ' mile'}</Text>
                  </View>
                  <View style={{marginTop: 10, marginRight: 20}}>
                    <ScrollView contentContainerStyle={{paddingVertical: 20}} style={{ maxHeight: DEVICE_HEIGHT * 0.3}}>
                      <Text style={{fontSize: 12, fontWeight: 'bold', color: '#fff'}}>{this.state.otherData.detail.description}</Text>
                    </ScrollView>
                  </View>
                </View>
                <View style={{ width: DEVICE_WIDTH * 0.5, marginLeft: DEVICE_WIDTH * 0.25, flexDirection: 'row', justifyContent: 'space-between' }}>
                  {/* <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.onReject()}>
                    <Icon type="FontAwesome" name={this.state.hateIcon} style={{ color: '#B64F54' }} />
                  </TouchableOpacity> */}
                  <Button
                    icon={
                      <Icon type="FontAwesome" name={this.state.hateIcon} style={{ color: '#B64F54' }} />
                    }
                    buttonStyle={{ width: 60, height: 60, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
                    loading={this.state.isLoading}
                    onPress={() => this.onReject()}
                  // disabled={this.state.disabled}
                  />
                  {/* <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.onHeart()}>
                    <Icon type="FontAwesome" name={this.state.heartIcon} style={{ color: '#fff' }} />
                  </TouchableOpacity> */}
                  <Button
                    icon={
                      <Icon type="FontAwesome" name={this.state.heartIcon} style={{ color: '#fff' }} />
                    }
                    buttonStyle={{ width: 60, height: 60, borderRadius: 50, backgroundColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    loading={this.state.isLoading}
                    onPress={() => this.onHeart()}
                  // disabled={this.state.disabled}
                  />
                </View>
              </View>
            </Content>
          )}

        {/* <Footer style={{ borderTopColor: '#222F3F', height: Platform.select({ 'android': 50, 'ios': 30 }) }}>
          <FooterTab style={{ backgroundColor: '#222F3F', alignSelf: 'stretch', alignItems: 'center', alignContent: 'space-around', flex: 1, flexDirection: 'row' }}>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent >
              <Image source={b_browse} style={{width : 25, height: 25, tintColor: '#B64F54' }} />
              <Text style={{ color: '#B64F54', fontSize: 6, fontWeight: 'bold', marginTop: 3, width: '100%' }}>{"BROWSE"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0, margin: 0, padding: 0 }} transparent onPress={() => this.gotoIncome()}>
              <Image source={b_incoming} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3, width: '100%' }}>{"INCOMING"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent onPress={() => this.gotoMatch()}>
              <Image source={b_match} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3, width: '100%' }}>{"MATCH"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent onPress={() => this.gotoChat()}>
              <Image source={b_chat} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"CHAT"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent onPress={() => this.gotoMyVideo()}>
              <Image source={b_myvideo} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"PROFILE"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent onPress={() => this.gotoGpay()}>
              <Image source={OnlyGImage} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"GPAY"}</Text>
            </Button>
          </FooterTab>
        </Footer> */}
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
export default Browse;
